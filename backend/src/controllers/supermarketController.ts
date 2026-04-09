import { Request, Response } from 'express';
import prisma from '../db';
import { sendOTP, sendTransportLink } from '../utils/mailer';
import { signToken } from '../utils/auth';

// 1. Mock Login / Auth
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { phone, email, name, password } = req.body;
    
    if (!email || !phone || !name || !password) {
        res.status(400).json({ error: 'Name, email, phone and password are required for registration' });
        return;
    }

    let user = await prisma.user.findUnique({ where: { email } });
    if (user) {
      res.status(400).json({ error: 'User with this email already exists' });
      return;
    }

    const { hashPassword } = await import('../utils/auth');

    user = await prisma.user.create({
      data: { name, email, phone, role: 'BUYER', is_verified: false, password: hashPassword(password) }
    });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiry = new Date(Date.now() + 10 * 60 * 1000);

    await prisma.user.update({
      where: { id: user.id },
      data: { otp_code: otp, otp_expiry: expiry }
    });

    if (email) {
      await sendOTP(email, otp);
    }

    res.status(201).json({ message: 'Registration successful. OTP sent.', user_id: user.id, debug_otp: otp });
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, phone, password } = req.body;

    if (!password) {
      res.status(400).json({ error: 'Password is required' });
      return;
    }

    const user = await prisma.user.findFirst({
        where: {
          OR: email ? [{ email }] : [{ phone }]
        }
    });

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    if (user.role !== 'BUYER') {
      res.status(403).json({ error: 'Invalid login: This account does not belong to a Buyer' });
      return;
    }

    if (!user.is_verified) {
      res.status(401).json({ error: 'User email not verified. Please verify OTP sent to your email first.' });
      return;
    }

    const { hashPassword } = await import('../utils/auth');
    if (!user.password || user.password !== hashPassword(password)) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    const token = signToken({ user_id: user.id, role: user.role, email: user.email });

    res.json({ message: 'Login successful', token, user });
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
};

export const verifyOTP = async (req: Request, res: Response): Promise<void> => {
    try {
      const { user_id, otp } = req.body;
      const user = await prisma.user.findUnique({ where: { id: user_id } });
      if (!user) { res.status(404).json({ error: 'User not found' }); return; }
      if (user.otp_code !== otp || !user.otp_expiry || user.otp_expiry < new Date()) {
        res.status(400).json({ error: 'Invalid or expired OTP' }); return;
      }
      const updatedUser = await prisma.user.update({
        where: { id: user_id },
        data: { is_verified: true, otp_code: null, otp_expiry: null }
      });

      const token = signToken({ user_id: updatedUser.id, role: updatedUser.role, email: updatedUser.email });

      res.json({ message: 'Verified', token, user: updatedUser });
    } catch (error) {
      res.status(500).json({ error: String(error) });
    }
};

// 2. Dashboard
export const getDashboard = async (req: Request, res: Response): Promise<void> => {
  try {
    const buyer_id = req.query.buyer_id as string;
    if (!buyer_id) { res.status(400).json({ error: 'buyer_id required' }); return; }

    const activeOrders = await prisma.order.count({
      where: { buyer_id, status: { in: ['PENDING', 'IN_TRANSIT'] } }
    });

    const pendingDeliveries = await prisma.job.count({
      where: { order: { buyer_id }, type: 'TRANSPORT', status: { in: ['PENDING', 'IN_PROGRESS'] } }
    });

    const spendAnalytics = await prisma.escrowAccount.aggregate({
      _sum: { total_amount: true },
      where: { order: { buyer_id } }
    });

    res.json({
      activeOrders,
      pendingDeliveries,
      totalSpend: spendAnalytics._sum.total_amount || 0
    });
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
};

// 3. Marketplace
export const getMarketplace = async (req: Request, res: Response): Promise<void> => {
  try {
    const { search } = req.query;
    
    const batches = await prisma.batch.findMany({
      where: {
        status: 'ACTIVE',
        ...(search && { crop: { contains: String(search), mode: 'insensitive' } })
      },
      include: {
        farmer: { select: { id: true, name: true, is_verified: true } },
        images: true
      },
      orderBy: { created_at: 'desc' }
    });
    res.json(batches);
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
};

export const getFarmers = async (req: Request, res: Response): Promise<void> => {
  try {
    const farmers = await prisma.user.findMany({
      where: { role: 'FARMER' },
      include: {
        profile: true,
        batches: {
          where: { status: 'ACTIVE' },
          select: { crop: true, category: true, quantity: true }
        }
      }
    });

    const enrichedFarmers = farmers.map(f => {
      // Calculate derived stats or just send raw
      return {
        id: f.id,
        name: f.name,
        is_verified: f.is_verified,
        created_at: f.created_at,
        profile: f.profile,
        active_listings: f.batches
      };
    });

    res.json(enrichedFarmers);
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
};

export const getListingDetails = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const batch = await prisma.batch.findUnique({
      where: { id },
      include: {
        farmer: { select: { id: true, name: true, phone: true, email: true } },
        images: true
      }
    });

    if (!batch) { res.status(404).json({ error: 'Listing not found' }); return; }
    res.json(batch);
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
};

// 4. Order Placement
export const placeOrder = async (req: Request, res: Response): Promise<void> => {
   try {
     const { buyer_id, batch_id, quantity, warehouse_id } = req.body;
     
     const batch = await prisma.batch.findUnique({ where: { id: batch_id } });
     if (!batch) { res.status(404).json({ error: 'Batch not found' }); return; }
     if (batch.status !== 'ACTIVE') { res.status(400).json({ error: 'Batch no longer active' }); return; }
     if (quantity > batch.quantity) { res.status(400).json({ error: 'Requested quantity exceeds available batch' }); return; }

     const total_amount = batch.price_per_unit * quantity;

     const order = await prisma.order.create({
       data: {
         buyer_id,
         batch_id,
         quantity,
         total_amount,
         warehouse_id, // Link to destination warehouse
         status: 'PENDING'
       }
     });

     // Update batch quantity or mark status sold if exhausted (mock simplified logic)
     const remainingQuantity = batch.quantity - quantity;
     await prisma.batch.update({
        where: { id: batch_id },
        data: {
          quantity: remainingQuantity,
          status: remainingQuantity <= 0 ? 'SOLD' : 'ACTIVE'
        }
     });

     res.status(201).json(order);
   } catch (error) {
     res.status(500).json({ error: String(error) });
   }
};

// 5. Mock Payment Page -> Creates Escrow
export const payOrder = async (req: Request, res: Response): Promise<void> => {
  try {
     const id = req.params.id as string;
     
     const order = await prisma.order.findUnique({ where: { id } });
     if (!order) { res.status(404).json({ error: 'Order not found' }); return; }
     if (order.status !== 'PENDING') { res.status(400).json({ error: 'Order is already processed' }); return; }

     // Handle Escrow and Payments in a transaction
     const result = await prisma.$transaction(async (tx) => {
        const payment = await tx.payment.create({
          data: {
            order_id: id,
            provider: 'RazorpayMock',
            amount: order.total_amount,
            status: 'SUCCESS',
            tx_id: `txn_${Date.now()}`
          }
        });

        const escrow = await tx.escrowAccount.create({ // Funds locked in Escrow
          data: {
             order_id: id,
             total_amount: order.total_amount,
             remaining_amount: order.total_amount,
             released_amount: 0,
             status: 'FUNDED',
             transactions: {
               create: { type: 'DEPOSIT', amount: order.total_amount }
             }
           }
        });

        const updatedOrder = await tx.order.update({
          where: { id },
          data: { status: 'IN_TRANSIT' } // Progress order pipeline
        });

        // Add 'CREATED' tracking log
        await tx.trackingLog.create({
          data: {
            batch_id: order.batch_id,
            event_type: 'CREATED'
          }
        });

        return { payment, escrow, updatedOrder };
     });

     res.json({ message: 'Payment successful, funds held in escrow', data: result });
  } catch (error) {
     res.status(500).json({ error: String(error) });
  }
};

// 6. Orders Management
export const getOrders = async (req: Request, res: Response): Promise<void> => {
  try {
    const buyer_id = req.query.buyer_id as string;
    if (!buyer_id) { res.status(400).json({ error: 'buyer_id required' }); return; }

    const orders = await prisma.order.findMany({
      where: { buyer_id },
      include: {
        batch: { select: { id: true, crop: true, location: true, images: true, farmer: { select: { id: true, name: true, phone: true } } } },
        warehouse: { select: { id: true, name: true, location: true } },
        escrow_account: { select: { status: true } },
        jobs: true
      },
      orderBy: { created_at: 'desc' }
    });
    
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
};

export const getOrderDetails = async (req: Request, res: Response): Promise<void> => {
   try {
     const id = req.params.id as string;
     const order = await prisma.order.findUnique({
       where: { id },
       include: {
         batch: { 
           include: { farmer: { select: { id: true, name: true, phone: true } }, tracking_logs: true }
         },
         escrow_account: true,
         payments: true,
         jobs: true
       }
     });

     if (!order) { res.status(404).json({ error: 'Order not found' }); return; }
     res.json(order);
   } catch (error) {
     res.status(500).json({ error: String(error) });
   }
};

// 7. Logistics Control Panel
export const generateLogisticsToken = async (req: Request, res: Response): Promise<void> => {
   try {
     const id = req.params.id as string;
     const { type, details } = req.body; // type: 'TRANSPORT' | 'WAREHOUSE'
     
     if (!type || !['TRANSPORT', 'WAREHOUSE'].includes(type as string)) {
        res.status(400).json({ error: 'Invalid or missing type. Must be TRANSPORT or WAREHOUSE' });
        return;
     }

     const order = await prisma.order.findUnique({ where: { id } });
     if (!order) { res.status(404).json({ error: 'Order not found' }); return; }

     // Generate secure link representation
     const token = `tok_${type.toLowerCase()}_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
     const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
     const link_url = type === 'TRANSPORT'
       ? `${frontendUrl}/delivery/${token}`
       : `${frontendUrl}/warehouse/${token}`;

     const job = await prisma.job.create({
       data: {
         order_id: id,
         type: type as any,
         token,
         link_url,
         details // e.g. { transporter_name: 'John Doe', vehicle: 'MH12AB1234' }
       }
     });

     // Log 'OUT_FOR_DELIVERY' when transporter job Is created/accepted
     if (type === 'TRANSPORT') {
       await prisma.trackingLog.create({
         data: {
           batch_id: order.batch_id,
           event_type: 'OUT_FOR_DELIVERY'
         }
       });
     }

      res.status(201).json({ message: 'Logistics link generated', job });
   } catch (error) {
     res.status(500).json({ error: String(error) });
   }
};

// 7.1 Logistics Control Panel Updates
export const updateLogisticsJob = async (req: Request, res: Response): Promise<void> => {
   try {
     const jobId = req.params.jobId as string;
     const { driver_name, vehicle_number, driver_email } = req.body;
     
     const job = await prisma.job.findUnique({ where: { id: jobId } });
     if (!job) { res.status(404).json({ error: 'Job not found' }); return; }

     await prisma.job.update({
       where: { id: jobId },
       data: {
         details: {
           ...(job.details as any),
           driver_name,
           vehicle_number,
           driver_email
         }
       }
     });

     res.json({ message: 'Logistics job updated successfully' });
   } catch (error) {
     res.status(500).json({ error: String(error) });
   }
};

export const deleteLogisticsJob = async (req: Request, res: Response): Promise<void> => {
   try {
     const jobId = req.params.jobId as string;
     await prisma.job.delete({ where: { id: jobId } });
     res.json({ message: 'Logistics job deleted successfully' });
   } catch (error) {
     res.status(500).json({ error: String(error) });
   }
};

export const sendLogisticsEmail = async (req: Request, res: Response): Promise<void> => {
   try {
     const jobId = req.params.jobId as string;
     const job = await prisma.job.findUnique({ where: { id: jobId } });
     
     if (!job) { res.status(404).json({ error: 'Job not found' }); return; }
     
     const details = job.details as any;
     const email = details?.driver_email;

     if (!email) {
       res.status(400).json({ error: 'No driver email recorded for this job' });
       return;
     }

     await sendTransportLink(email, job.token, job.id);
     res.json({ message: 'Transport link emailed to driver successfully!' });
   } catch (error) {
     res.status(500).json({ error: String(error) });
   }
};

// 8. Consumer QRs
export const getConsumerQRs = async (req: Request, res: Response): Promise<void> => {
  try {
    const buyer_id = req.query.buyer_id as string;
    if (!buyer_id) { res.status(400).json({ error: 'buyer_id required' }); return; }

    const orders = await prisma.order.findMany({
      where: { buyer_id, status: 'DELIVERED' },
      include: {
        batch: {
          select: {
            id: true,
            crop: true,
            harvest_date: true,
            qr_code_url: true
          }
        }
      }
    });

    const qrs = orders.map(o => ({
      product: o.batch.crop,
      harvest_date: o.batch.harvest_date,
      trace_url: `http://localhost:5000/api/public/trace/${o.batch.id}`, // Public scan link
      order_id: o.id
    }));

    res.json(qrs);
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
};
