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

     // QR Match validation
     if (qr_code !== job.order.batch.qr_code_url) {
       res.status(400).json({ error: 'Invalid QR Code scan mismatch' }); return;
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
    await sendHandoverQR(warehouse_email, handover_token);

    res.json({
      message: 'Handover initiated. Email sent to warehouse collector.',
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
