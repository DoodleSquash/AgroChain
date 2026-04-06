import express, { Request, Response } from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import http from 'http';
import { Server } from 'socket.io';
import prisma from './db';
import farmerRoutes from './routes/farmerRoutes';
import supermarketRoutes from './routes/supermarketRoutes';
import logisticsRoutes from './routes/logisticsRoutes';
import publicRoutes from './routes/publicRoutes';
import uploadRoutes from './routes/uploadRoutes';
import aiRoutes from './routes/aiRoutes';
import voiceRoutes from './routes/voiceRoutes';
import chatRoutes from './routes/chatRoutes';
import { ensureBucket } from './utils/supabase';

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

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
app.use('/api/voice', voiceRoutes);
app.use('/api/chat', chatRoutes);

app.get('/', (req: Request, res: Response) => {
  res.json({ message: 'AgroChain Backend API is running' });
});

app.get('/health', async (req: Request, res: Response) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: 'healthy', database: 'connected' });
  } catch (error) {
    res.status(500).json({ status: 'unhealthy', database: 'disconnected', error: String(error) });
  }
});

// Socket.io for Real-time Chat
io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  socket.on('join_chat', (chatId) => {
    socket.join(chatId);
    console.log(`Socket ${socket.id} joined chat ${chatId}`);
  });

  socket.on('send_message', async (data) => {
    try {
      const { chat_id, sender_id, content, image_url } = data;
      
      const message = await prisma.message.create({
        data: {
          chat_id,
          sender_id,
          content,
          image_url
        }
      });

      // Update the chat's updated_at
      await prisma.chat.update({
        where: { id: chat_id },
        data: { updated_at: new Date() }
      });

      io.to(chat_id).emit('receive_message', message);
    } catch (err) {
      console.error('Error sending message:', err);
    }
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

server.listen(Number(port), '0.0.0.0', () => {
  console.log(`Server is running on http://0.0.0.0:${port}`);
  ensureBucket();
});

export default app;
