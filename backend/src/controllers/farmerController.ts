import { Request, Response } from 'express';
import prisma from '../db';
import { sendOTP } from '../utils/mailer';
import { signToken } from '../utils/auth';

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { phone, email, name } = req.body;
    
    if (!email || !phone || !name) {
        res.status(400).json({ error: 'Name, email and phone are required for registration' });
        return;
    }

    let user = await prisma.user.findUnique({ where: { email } });
    if (user) {
      res.status(400).json({ error: 'User with this email already exists' });
      return;
    }

    user = await prisma.user.create({
      data: { name, email, phone, role: 'FARMER', is_verified: false }
    });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiry = new Date(Date.now() + 10 * 60 * 1000);

    await prisma.user.update({
      where: { id: user.id },
      data: { otp_code: otp, otp_expiry: expiry }
    });

    await sendOTP(email, otp);

    res.status(201).json({ 
      message: 'Registration successful. OTP sent for verification.', 
      user_id: user.id,
      debug_otp: otp 
    });
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, phone } = req.body;

    const user = await prisma.user.findFirst({
      where: {
        OR: email ? [{ email }] : [{ phone }]
      }
    });

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    if (user.role !== 'FARMER') {
      res.status(403).json({ error: 'Invalid login: This account does not belong to a Farmer' });
      return;
    }

    if (!user.is_verified) {
      res.status(401).json({ error: 'User email not verified. Please verify OTP first.' });
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
       res.status(400).json({ error: 'Invalid or expired OTP' });
       return;
     }

     const updatedUser = await prisma.user.update({
       where: { id: user_id },
       data: { is_verified: true, otp_code: null, otp_expiry: null }
     });

     const token = signToken({ user_id: updatedUser.id, role: updatedUser.role, email: updatedUser.email });

     res.json({ message: 'Verification successful', token, user: updatedUser });
   } catch (error) {
     res.status(500).json({ error: String(error) });
   }
};

export const getDashboard = async (req: Request, res: Response): Promise<void> => {
  try {
    const farmer_id = req.query.farmer_id as string;
    if (!farmer_id) {
       res.status(400).json({ error: 'farmer_id query param is required' });
       return;
    }
    
    const activeListings = await prisma.batch.count({
      where: { farmer_id: farmer_id, status: 'ACTIVE' }
    });
    
    // orders connected to this farmer's batches
    const pendingOrders = await prisma.order.count({
      where: { batch: { farmer_id: farmer_id }, status: 'PENDING' }
    });

    const earnings = await prisma.escrowAccount.aggregate({
      _sum: { released_amount: true },
      where: { order: { batch: { farmer_id: farmer_id } } }
    });

    res.json({
      activeListings,
      pendingOrders,
      totalEarnings: earnings._sum.released_amount || 0
    });
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
};

export const createListing = async (req: Request, res: Response): Promise<void> => {
  try {
    const { farmer_id, crop, category, quantity, price_per_unit, harvest_date, expiry_date, location, images, badges } = req.body;

    if (!quantity || Number(quantity) <= 0) {
      res.status(400).json({ error: 'Quantity must be greater than zero' });
      return;
    }
    
    // Create batch first to get the real UUID
    const batch = await prisma.batch.create({
      data: {
        farmer_id,
        crop,
        category: category || 'Vegetables',
        quantity,
        price_per_unit,
        total_price: quantity * price_per_unit,
        harvest_date: new Date(harvest_date),
        expiry_date: expiry_date ? new Date(expiry_date) : null,
        location,
        badges: badges || [],
        qr_code_url: '', // placeholder
        images: {
          create: images?.map((url: string) => ({ image_url: url })) || []
        }
      },
      include: { images: true }
    });

    // Update with real batch ID in QR URL
    const qr_code_url = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/trace/${batch.id}`;
    const updated = await prisma.batch.update({
      where: { id: batch.id },
      data: { qr_code_url },
      include: { images: true }
    });
    
    res.status(201).json(updated);
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
};

export const getListings = async (req: Request, res: Response): Promise<void> => {
  try {
    const farmer_id = req.query.farmer_id as string;
    if (!farmer_id) { res.status(400).json({ error: 'farmer_id required' }); return; }
    
    const batches = await prisma.batch.findMany({
      where: { farmer_id: farmer_id },
      include: { images: true },
      orderBy: { created_at: 'desc' }
    });

    const response = batches.map(b => ({
      ...b,
      debug_qr_code: b.qr_code_url // Helpful for manual Postman testing
    }));

    res.json(response);
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
};

export const updateListing = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const { status, price_per_unit, quantity, location, category, new_images } = req.body;

    if (quantity !== undefined && Number(quantity) <= 0) {
      res.status(400).json({ error: 'Quantity must be greater than zero' });
      return;
    }
    
    const batch = await prisma.batch.update({
      where: { id },
      data: {
        status, 
        price_per_unit, 
        quantity, 
        location,
        category,
        ...(quantity && price_per_unit && { total_price: quantity * price_per_unit }),
        ...(new_images && Array.isArray(new_images) && new_images.length > 0 && {
          images: {
            deleteMany: {},
            create: new_images.map((url: string) => ({ image_url: url }))
          }
        })
      },
      include: { images: true }
    });
    res.json(batch);
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
};

export const deleteListing = async (req: Request, res: Response): Promise<void> => {
   try {
     const id = req.params.id as string;
     await prisma.batch.delete({ where: { id } });
     res.json({ message: 'Listing deleted successfully' });
   } catch (error) {
     res.status(500).json({ error: String(error) });
   }
};

export const getOrders = async (req: Request, res: Response): Promise<void> => {
   try {
     const farmer_id = req.query.farmer_id as string;
     if (!farmer_id) { res.status(400).json({ error: 'farmer_id required' }); return; }
     
     const orders = await prisma.order.findMany({
       where: { batch: { farmer_id: farmer_id } },
       include: {
         buyer: { select: { name: true, phone: true } },
         batch: { select: { crop: true, quantity: true } },
         escrow_account: { select: { status: true, total_amount: true, released_amount: true } },
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
        buyer: { select: { name: true, email: true, phone: true } },
        batch: { include: { tracking_logs: true } },
        escrow_account: true,
      }
    });
    if (!order) { res.status(404).json({ error: 'Order not found' }); return; }
    res.json(order);
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
};

export const getPayments = async (req: Request, res: Response): Promise<void> => {
  try {
    const farmer_id = req.query.farmer_id as string;
     if (!farmer_id) { res.status(400).json({ error: 'farmer_id required' }); return; }
     
     const accounts = await prisma.escrowAccount.findMany({
       where: { order: { batch: { farmer_id: farmer_id } } },
       include: { order: { select: { id: true, batch: { select: { crop: true } } } }, transactions: true }
     });
     
     let totalEarnings = 0;
     let pendingPayments = 0;
     let releasedPayments = 0;
     
     accounts.forEach((acc: any) => {
       totalEarnings += acc.total_amount;
       pendingPayments += acc.remaining_amount;
       releasedPayments += acc.released_amount;
     });
     
     res.json({
       totalEarnings,
       pendingPayments,
       releasedPayments,
       accounts
     });
  } catch (error) {
     res.status(500).json({ error: String(error) });
  }
};

export const getQR = async (req: Request, res: Response): Promise<void> => {
   try {
     const id = req.params.id as string;
     const batch = await prisma.batch.findUnique({ where: { id }, select: { qr_code_url: true } });
     if (!batch) { res.status(404).json({ error: 'Batch not found' }); return; }

     const QRCode = await import('qrcode');
     const traceUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/trace/${id}`;

     // Return as base64 data URL so frontend can display without auth headers
     const dataUrl = await QRCode.default.toDataURL(traceUrl, { width: 300, margin: 2 });
     res.json({ qr_data_url: dataUrl, trace_url: traceUrl });
   } catch (error) {
     res.status(500).json({ error: String(error) });
   }
}

export const createHiringJob = async (req: Request, res: Response): Promise<void> => {
   try {
     const { farmer_id, title, location, lat, lng, wage, workers_needed, work_date, description } = req.body;
     
     const job = await prisma.hiringJob.create({
       data: {
         farmer_id,
         title,
         location,
         lat: lat ? parseFloat(lat) : null,
         lng: lng ? parseFloat(lng) : null,
         wage,
         workers_needed: parseInt(workers_needed),
         work_date: new Date(work_date),
         description
       }
     });
     
     res.status(201).json(job);
   } catch (error) {
     res.status(500).json({ error: String(error) });
   }
};

export const getHiringJobs = async (req: Request, res: Response): Promise<void> => {
   try {
     const farmer_id = req.query.farmer_id as string;
     if (!farmer_id) { res.status(400).json({ error: 'farmer_id required' }); return; }
     
     const jobs = await prisma.hiringJob.findMany({
       where: { farmer_id },
       include: { applications: true },
       orderBy: { created_at: 'desc' }
     });
     
     res.json(jobs);
   } catch (error) {
     res.status(500).json({ error: String(error) });
   }
};

export const deleteHiringJob = async (req: Request, res: Response): Promise<void> => {
   try {
     const id = req.params.id as string;
     await prisma.hiringJob.delete({ where: { id } });
     res.json({ message: 'Hiring job deleted successfully' });
   } catch (error) {
     res.status(500).json({ error: String(error) });
   }
};

export const getBuyers = async (req: Request, res: Response): Promise<void> => {
   try {
     const buyers = await prisma.user.findMany({
       where: { role: 'BUYER' },
       include: {
         profile: true
       }
     });

     const enrichedBuyers = buyers.map(b => {
       const { otp_code, otp_expiry, ...safeUser } = b;
       return safeUser;
     });

     res.json(enrichedBuyers);
   } catch (error) {
     res.status(500).json({ error: String(error) });
   }
};
