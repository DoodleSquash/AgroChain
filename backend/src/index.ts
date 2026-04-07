import express, { Request, Response } from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import prisma from './db';
import farmerRoutes from './routes/farmerRoutes';
import supermarketRoutes from './routes/supermarketRoutes';
import logisticsRoutes from './routes/logisticsRoutes';
import publicRoutes from './routes/publicRoutes';
import uploadRoutes from './routes/uploadRoutes';
import aiRoutes from './routes/aiRoutes';
import { ensureBucket } from './utils/supabase';

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

app.use(morgan('dev'));
app.use(cors());
app.use(express.json());

app.use('/api/farmers', farmerRoutes);
app.use('/api/supermarket', supermarketRoutes);
app.use('/api/logistics', logisticsRoutes);
app.use('/api/public', publicRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/ai', aiRoutes);

app.get('/', (req: Request, res: Response) => {
  res.json({ message: 'AgroChain Backend API is running' });
});

// Health check route
app.get('/health', async (req: Request, res: Response) => {
  try {
    // Basic connectivity check to database
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: 'healthy', database: 'connected' });
  } catch (error) {
    res.status(500).json({ status: 'unhealthy', database: 'disconnected', error: String(error) });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
  ensureBucket();
});

export default app;
