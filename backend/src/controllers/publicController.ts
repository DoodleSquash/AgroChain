import { Request, Response } from 'express';
import prisma from '../db';

// Public endpoint to fetch full history of a batch via QR/BatchID
export const getTrace = async (req: Request, res: Response): Promise<void> => {
  try {
    const batchId = req.params.batchId as string;
    
    const batch = await prisma.batch.findUnique({
      where: { id: batchId },
      include: {
        farmer: {
          select: {
            name: true,
            created_at: true
          }
        },
        images: true,
        tracking_logs: {
          orderBy: { timestamp: 'asc' }
        }
      }
    });

    if (!batch) {
      res.status(404).json({ error: 'Product batch not found' });
      return;
    }

    res.json(batch);
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
};

export const getHiringJobPublic = async (req: Request, res: Response): Promise<void> => {
   try {
     const id = req.params.id as string;
     const job = await prisma.hiringJob.findUnique({
       where: { id },
       include: { farmer: { select: { name: true } } }
     });
     if (!job) { res.status(404).json({ error: 'Job not found' }); return; }
     res.json(job);
   } catch (error) {
     res.status(500).json({ error: String(error) });
   }
};

export const applyToHiringJob = async (req: Request, res: Response): Promise<void> => {
   try {
     const { job_id, name, phone, skills, candidate_location, lat, lng } = req.body;
     
     const application = await prisma.jobApplication.create({
       data: {
         job_id,
         name,
         phone,
         skills,
         candidate_location,
         lat: lat ? parseFloat(lat) : null,
         lng: lng ? parseFloat(lng) : null
       }
     });
     
     res.status(201).json(application);
   } catch (error) {
     res.status(500).json({ error: String(error) });
   }
};

export const getUserProfile = async (req: Request, res: Response): Promise<void> => {
   try {
     const id = req.params.id as string;
     
     const user = await prisma.user.findUnique({
       where: { id },
       include: {
         profile: true,
         batches: {
           where: { status: 'ACTIVE' },
           select: { id: true, crop: true, category: true, quantity: true, price_per_unit: true, images: true }
         },
         orders: {
           where: { status: 'COMPLETED' },
           include: {
             batch: {
               include: { farmer: { select: { id: true, name: true } } }
             }
           }
         }
       }
     });

     // Because Prisma's include.orders only fetches orders where the user is the buyer (due to BuyerOrders relation),
     // we also need to fetch orders where the user is the farmer (seller) for completed sales.
     let sellerOrders: any[] = [];
     if (user?.role === 'FARMER') {
       sellerOrders = await prisma.order.findMany({
         where: {
           batch: { farmer_id: id },
           status: 'COMPLETED'
         },
         include: {
           buyer: { select: { id: true, name: true } },
           batch: true
         }
       });
     }

     if (!user) {
       res.status(404).json({ error: 'User not found' });
       return;
     }

     // Hide sensitive data like OTPs, Email (unless verified), password etc based on business logic. 
     // For now, strip otp details.
     const { otp_code, otp_expiry, ...safeUser } = user;
     
     res.json({ ...safeUser, sellerOrders });
   } catch (error) {
     res.status(500).json({ error: String(error) });
   }
};

export const updateProfile = async (req: Request | any, res: Response): Promise<void> => {
   try {
     const userId = req.user?.user_id;
     if (!userId) {
       res.status(401).json({ error: 'Unauthorized' });
       return;
     }

     const {
       phone, location, bio, profile_picture, farmer_type, company_name, purchasing_prefs, buyer_type, price_range
     } = req.body;

     // Update phone on User record if provided
     if (phone !== undefined) {
       await prisma.user.update({
         where: { id: userId },
         data: { phone: phone || null }
       });
     }

     const profile = await prisma.profile.upsert({
       where: { user_id: userId },
       update: { location, bio, profile_picture, farmer_type, company_name, purchasing_prefs, buyer_type, price_range },
       create: { user_id: userId, location, bio, profile_picture, farmer_type, company_name, purchasing_prefs, buyer_type, price_range }
     });

     // Track Farmer Type globally
     if (farmer_type && typeof farmer_type === 'string') {
       const typeName = farmer_type.trim();
       if (typeName) {
         const existing = await prisma.farmerType.findUnique({ where: { name: typeName } });
         if (existing) {
           await prisma.farmerType.update({
             where: { id: existing.id },
             data: { usage: { increment: 1 } }
           });
         } else {
           await prisma.farmerType.create({
             data: { name: typeName, usage: 1 }
           });
         }
       }
     }

     res.json(profile);
   } catch (error) {
     console.error('updateProfile error:', error);
     res.status(500).json({ error: String(error) });
   }
};

export const getFarmerTypes = async (req: Request, res: Response): Promise<void> => {
  try {
    const types = await prisma.farmerType.findMany({
      orderBy: { usage: 'desc' },
      take: 20
    });
    res.json(types);
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
};
