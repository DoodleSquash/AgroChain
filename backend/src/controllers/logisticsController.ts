import { Request, Response } from 'express';
import prisma from '../db';
import { v4 as uuidv4 } from 'uuid';
import { sendHandoverQR } from '../utils/mailer';

// 1. Get Job Details securely via Token
export const getJobDetails = async (req: Request, res: Response): Promise<void> => {
  try {
    const token = (req.params.token as string).trim();
    console.log(`[Logistics] Fetching details for token: "${token}"`);
    
    const job = await prisma.job.findUnique({
      where: { token },
      include: {
        order: {
          include: {
            buyer: { select: { name: true, phone: true } },
            batch: {
              include: {
                farmer: { select: { name: true, phone: true } }
              }
            }
          }
        }
      }
    });

    if (!job) { 
      console.warn(`[Logistics] Job not found for token: "${token}"`);
      res.status(404).json({ 
        error: 'Invalid or expired logistics token',
        hint: 'Are you using the "token" field? (starts with tok_), not the "id" UUID field.'
      }); 
      return; 
    }
    res.json(job);
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
};

// 2. Mark Transport Pickup -> Triggers 40% Escrow Release
export const markPickup = async (req: Request, res: Response): Promise<void> => {
   try {
     const token = req.params.token as string;
     const { qr_code, image_url } = req.body;

     const job = await prisma.job.findUnique({ where: { token }, include: { order: { include: { batch: true, escrow_account: true } } } });
     if (!job) { res.status(404).json({ error: 'Job not found' }); return; }
     if (job.type !== 'TRANSPORT') { res.status(400).json({ error: 'Invalid job type for pickup' }); return; }
     if (job.status !== 'PENDING') { res.status(400).json({ error: 'Job is already in progress or completed' }); return; }

     // QR Match validation - Use Job Token as the 'Billing QR'
     if (qr_code !== job.token) {
       res.status(400).json({ error: 'Invalid Billing QR Code' }); return;
     }

     const escrow = job.order.escrow_account;
     if (!escrow || escrow.status !== 'FUNDED') {
       res.status(400).json({ error: 'Escrow account is not properly funded' }); return;
     }

     // Calculate 40% release
     const releaseAmount = Number(((escrow.total_amount * 40) / 100).toFixed(2));
     const newReleasedContent = escrow.released_amount + releaseAmount;
     const newRemainingAmount = escrow.total_amount - newReleasedContent;

     await prisma.$transaction(async (tx) => {
       // 1. Track Event
       await tx.trackingLog.create({
         data: { batch_id: job.order.batch_id, event_type: 'PICKED_UP', image_url }
       });

       // 2. Update Job
       await tx.job.update({ where: { id: job.id }, data: { status: 'IN_PROGRESS' } });

       // 3. Update Escrow
       await tx.escrowAccount.update({
         where: { id: escrow.id },
         data: {
           released_amount: newReleasedContent,
           remaining_amount: newRemainingAmount,
           status: 'PARTIAL_RELEASED',
           transactions: { create: { type: 'PARTIAL_RELEASE', amount: releaseAmount } }
         }
       });
     });

     res.json({ message: 'Pickup successful. 40% Escrow released to farmer.' });
   } catch (error) {
     res.status(500).json({ error: String(error) });
   }
};

// 3. Initiate Handover (Transporter side)
export const initiateHandover = async (req: Request, res: Response): Promise<void> => {
  try {
    const token = (req.params.token as string).trim();
    const { warehouse_email } = req.body;

    if (!warehouse_email) {
      res.status(400).json({ error: 'Warehouse collector email is required' });
      return;
    }

    const job = await prisma.job.findUnique({ where: { token } });
    if (!job) { res.status(404).json({ error: 'Job not found' }); return; }
    if (job.status !== 'IN_PROGRESS') {
      res.status(400).json({ error: 'Job must be in progress to initiate delivery' });
      return;
    }

    const handover_token = uuidv4();
    
    // Update job details with handover info
    await prisma.job.update({
      where: { id: job.id },
      data: {
        details: {
          ...(job.details as any),
          handover_token,
          warehouse_email
        }
      }
    });

    // Send email to warehouse collector
    try {
      await sendHandoverQR(warehouse_email, handover_token);
    } catch (e) {
      console.warn('[Logistics] Failed to send handover QR email:', e);
    }

    res.json({
      message: 'Handover initiated. Email sent to warehouse collector (if configured).',
      handover_token,
      hint: 'Display this token as a QR code for the warehouse collector to scan.'
    });
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
};

// 4. Confirm Handover (Warehouse Collector side)
export const confirmHandover = async (req: Request, res: Response): Promise<void> => {
  try {
    const handoverToken = req.params.handoverToken as string;
    const { image_url } = req.body;

    // Find job by handover_token inside details JSON
    const job = await prisma.job.findFirst({
        where: {
            details: {
                path: ['handover_token'],
                equals: handoverToken
            }
        },
        include: { order: { include: { escrow_account: true } } }
    });

    if (!job) {
      res.status(404).json({ error: 'Invalid or expired handover token' });
      return;
    }

    if (job.status !== 'IN_PROGRESS') {
      res.status(400).json({ error: 'Handover already processed' });
      return;
    }

    const escrow = job.order.escrow_account;
    if (!escrow || escrow.status !== 'PARTIAL_RELEASED') {
      res.status(400).json({ error: 'Escrow status mismatch' });
      return;
    }

    const finalReleaseAmount = escrow.remaining_amount;

    await prisma.$transaction(async (tx) => {
      // 1. Log Event
      await tx.trackingLog.create({
        data: { batch_id: job.order.batch_id, event_type: 'DELIVERED', image_url }
      });

      // 2. Complete Job & Order
      await tx.job.update({ where: { id: job.id }, data: { status: 'COMPLETED' } });
      await tx.order.update({ where: { id: job.order_id }, data: { status: 'DELIVERED' } });

      // 3. Final Escrow Release
      await tx.escrowAccount.update({
        where: { id: escrow.id },
        data: {
          released_amount: escrow.total_amount,
          remaining_amount: 0,
          status: 'COMPLETED',
          transactions: { create: { type: 'FINAL_RELEASE', amount: finalReleaseAmount } }
        }
      });
    });

    res.json({ message: 'Delivery confirmed. Final funds released to farmer.' });
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
};

// 5. Warehouse Logging
export const logWarehouseData = async (req: Request, res: Response): Promise<void> => {
   try {
     const token = req.params.token as string;
     const { weight, quality_grade, storage_condition } = req.body;

     const job = await prisma.job.findUnique({ where: { token }, include: { order: true } });
     if (!job) { res.status(404).json({ error: 'Job token not found' }); return; }
     if (job.type !== 'WAREHOUSE') { res.status(400).json({ error: 'Token restricted to warehouse bounds only.' }); return; }

     await prisma.$transaction(async (tx) => {
       await tx.trackingLog.create({
         data: {
           batch_id: job.order.batch_id,
           event_type: 'STORED',
           metadata: { weight, quality_grade, storage_condition }
         }
       });
       await tx.job.update({ where: { id: job.id }, data: { status: 'COMPLETED' } });
     });

     res.json({ message: 'Warehouse storage data synchronized to public QR trace' });
   } catch (error) {
     res.status(500).json({ error: String(error) });
   }
};

// 6. OTP-based Pickup Verification
// POST /api/logistics/jobs/:token/verify-otp
// Step 1: body = { phone } → sends OTP to farmer if phone matches
// Step 2: body = { phone, otp } → verifies OTP and marks pickup
export const verifyPickupOTP = async (req: Request, res: Response): Promise<void> => {
  try {
    const token = req.params.token as string;
    const { email, otp } = req.body;

    const job = await prisma.job.findUnique({
      where: { token },
      include: {
        order: {
          include: {
            batch: { include: { farmer: true } },
            escrow_account: true,
          }
        }
      }
    });

    if (!job) { res.status(404).json({ error: 'Job not found' }); return; }
    if (job.type !== 'TRANSPORT') { res.status(400).json({ error: 'Not a transport job' }); return; }

    const farmer = job.order.batch.farmer;

    // Step 1: Send OTP
    if (!otp) {
      if (!email) { res.status(400).json({ error: 'Email required' }); return; }
      if (farmer.email !== email) {
        res.status(400).json({ error: 'Email does not match farmer records' }); return;
      }

      const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
      const expiry = new Date(Date.now() + 10 * 60 * 1000);

      await prisma.user.update({
        where: { id: farmer.id },
        data: { otp_code: generatedOtp, otp_expiry: expiry }
      });

      // Try to send email OTP (silently fails if email not configured)
      if (farmer.email) {
        const { sendOTP } = await import('../utils/mailer');
        await sendOTP(farmer.email, generatedOtp);
      }

      res.json({
        message: 'OTP sent to farmer. Ask the farmer to share the code.',
        debug_otp: generatedOtp // remove in production
      });
      return;
    }

    // Step 2: Verify OTP and mark pickup
    const updatedFarmer = await prisma.user.findUnique({ where: { id: farmer.id } });
    if (!updatedFarmer?.otp_code || updatedFarmer.otp_code !== otp) {
      res.status(400).json({ error: 'Invalid OTP' }); return;
    }
    if (!updatedFarmer.otp_expiry || updatedFarmer.otp_expiry < new Date()) {
      res.status(400).json({ error: 'OTP expired' }); return;
    }
    if (job.status !== 'PENDING') {
      res.status(400).json({ error: 'Job already processed' }); return;
    }

    const escrow = job.order.escrow_account;
    if (!escrow || escrow.status !== 'FUNDED') {
      res.status(400).json({ error: 'Order payment is pending. Please ask the buyer to fund the escrow before pickup.' }); 
      return;
    }

    const releaseAmount = Number(((escrow.total_amount * 40) / 100).toFixed(2));

    await prisma.$transaction(async (tx) => {
      await tx.trackingLog.create({
        data: { batch_id: job.order.batch_id, event_type: 'PICKED_UP' }
      });
      await tx.job.update({ where: { id: job.id }, data: { status: 'IN_PROGRESS' } });
      await tx.escrowAccount.update({
        where: { id: escrow.id },
        data: {
          released_amount: escrow.released_amount + releaseAmount,
          remaining_amount: escrow.total_amount - (escrow.released_amount + releaseAmount),
          status: 'PARTIAL_RELEASED',
          transactions: { create: { type: 'PARTIAL_RELEASE', amount: releaseAmount } }
        }
      });
      await tx.user.update({ where: { id: farmer.id }, data: { otp_code: null, otp_expiry: null } });
    });

    res.json({ message: 'Pickup verified via OTP. 40% escrow released to farmer.' });
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
};

// 7. OTP-based Delivery Verification (Warehouse)
// POST /api/logistics/jobs/:token/verify-delivery
// Step 1: body = { warehouse_email } -> sends OTP to warehouse collector
// Step 2: body = { warehouse_email, otp } -> verifies and completes delivery
export const verifyDeliveryOTP = async (req: Request, res: Response): Promise<void> => {
  try {
    const token = req.params.token as string;
    const { warehouse_email, otp } = req.body;

    const job = await prisma.job.findUnique({
      where: { token },
      include: {
        order: {
          include: {
            batch: true,
            escrow_account: true,
            warehouse: true // Verify the destination warehouse
          }
        }
      }
    });

    if (!job) { res.status(404).json({ error: 'Job not found' }); return; }
    if (job.status !== 'IN_PROGRESS') {
      res.status(400).json({ error: 'Job must be in transit to confirm delivery' });
      return;
    }

    const order = job.order;
    if (!order.warehouse_id) {
       res.status(400).json({ error: 'No destination warehouse assigned to this order. Management must assign one first.' });
       return;
    }

    // Verify the email belongs to a worker in the SPECIFIC warehouse assigned to the order
    const worker = await prisma.warehouseWorker.findFirst({
      where: { 
        email: warehouse_email, 
        warehouse_id: order.warehouse_id 
      }
    });

    if (!worker) {
      res.status(404).json({ error: 'Unauthorized personnel. This email is not registered at the assigned destination warehouse.' });
      return;
    }

    // Step 1: Send OTP
    if (!otp) {
      const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
      const expiry = new Date(Date.now() + 10 * 60 * 1000);

      await prisma.warehouseWorker.update({
        where: { id: worker.id },
        data: { otp_code: generatedOtp, otp_expiry: expiry }
      });

      // Send email
      const { sendOTP } = await import('../utils/mailer');
      await sendOTP(warehouse_email, generatedOtp);

      res.json({
        message: 'OTP sent to warehouse worker email.',
        debug_otp: generatedOtp // remove in production
      });
      return;
    }

    // Step 2: Verify OTP and finalize delivery
    if (worker.otp_code !== otp) {
      res.status(400).json({ error: 'Invalid OTP' }); return;
    }
    if (!worker.otp_expiry || worker.otp_expiry < new Date()) {
      res.status(400).json({ error: 'OTP expired' }); return;
    }

    const escrow = job.order.escrow_account;
    if (!escrow || escrow.status !== 'PARTIAL_RELEASED') {
      res.status(400).json({ error: 'Escrow status mismatch. Is pickup completed?' });
      return;
    }

    const finalReleaseAmount = escrow.remaining_amount;

    await prisma.$transaction(async (tx) => {
      // 1. Log Event
      await tx.trackingLog.create({
        data: { batch_id: job.order.batch_id, event_type: 'DELIVERED' }
      });

      // 2. Complete Job & Order
      await tx.job.update({ where: { id: job.id }, data: { status: 'COMPLETED' } });
      await tx.order.update({ where: { id: job.order_id }, data: { status: 'DELIVERED' } });

      // 3. Final Escrow Release
      await tx.escrowAccount.update({
        where: { id: escrow.id },
        data: {
          released_amount: escrow.total_amount,
          remaining_amount: 0,
          status: 'COMPLETED',
          transactions: { create: { type: 'FINAL_RELEASE', amount: finalReleaseAmount } }
        }
      });

      // 4. Clear OTP
      await tx.warehouseWorker.update({ where: { id: worker.id }, data: { otp_code: null, otp_expiry: null } });
    });

    res.json({ message: 'Delivery confirmed via OTP. Final payment released to farmer.' });
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
};
