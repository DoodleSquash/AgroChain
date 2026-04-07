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
