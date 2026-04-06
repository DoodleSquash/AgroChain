import { Request, Response } from 'express';
import prisma from '../db';

export const getChats = async (req: Request | any, res: Response): Promise<void> => {
  try {
    const userId = req.user?.user_id;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const chats = await prisma.chat.findMany({
      where: {
        OR: [{ farmer_id: userId }, { buyer_id: userId }]
      },
      include: {
        messages: {
          orderBy: { created_at: 'desc' },
          take: 1
        }
      },
      orderBy: { updated_at: 'desc' }
    });

    const chatList = chats.filter(c => c.farmer_id !== c.buyer_id);

    const otherUserIds = chatList.map(c => c.farmer_id === userId ? c.buyer_id : c.farmer_id);
    const users = await prisma.user.findMany({
      where: { id: { in: otherUserIds } },
      select: { id: true, name: true, role: true, profile: { select: { profile_picture: true } } }
    });
    const usersMap = new Map(users.map(u => [u.id, u]));

    const enrichedChats = chatList.map(c => {
      const otherId = c.farmer_id === userId ? c.buyer_id : c.farmer_id;
      return { ...c, otherUser: usersMap.get(otherId) };
    });

    res.json(enrichedChats);
  } catch (error) {
    console.error('getChats error:', error);
    res.status(500).json({ error: String(error) });
  }
};

export const getMessages = async (req: Request | any, res: Response): Promise<void> => {
   try {
     const userId = req.user?.user_id;
     if (!userId) { res.status(401).json({ error: 'Unauthorized' }); return; }
     
     const chatId = req.params.chatId;
     
     // Validate chat membership
     const chat = await prisma.chat.findUnique({ where: { id: chatId } });
     if (!chat || (chat.farmer_id !== userId && chat.buyer_id !== userId)) {
        res.status(403).json({ error: 'Forbidden' });
        return;
     }

     const messages = await prisma.message.findMany({
       where: { chat_id: chatId },
       orderBy: { created_at: 'asc' }
     });

     res.json(messages);
   } catch (error) {
     res.status(500).json({ error: String(error) });
   }
};

export const startOrGetChat = async (req: Request | any, res: Response): Promise<void> => {
   try {
     const userId = req.user?.user_id;
     if (!userId) { res.status(401).json({ error: 'Unauthorized' }); return; }
     
     const { targetUserId } = req.body;
     if (userId === targetUserId) {
        res.status(400).json({ error: 'You cannot chat with yourself' });
        return;
     }

     const targetUser = await prisma.user.findUnique({ where: { id: targetUserId } });
     if (!targetUser) { res.status(404).json({ error: 'Target user not found' }); return; }

     const userRole = req.user?.role;
     const targetRole = targetUser.role;

     let farmer_id: string, buyer_id: string;

     if (userRole === 'FARMER' && (targetRole === 'BUYER' || targetRole === 'WAREHOUSE')) {
        farmer_id = userId;
        buyer_id = targetUserId;
     } else if ((userRole === 'BUYER' || userRole === 'WAREHOUSE') && targetRole === 'FARMER') {
        buyer_id = userId;
        farmer_id = targetUserId;
     } else {
        res.status(400).json({ error: 'Invalid chat participants' });
        return;
     }

     let chat = await prisma.chat.findUnique({
       where: { farmer_id_buyer_id: { farmer_id, buyer_id } }
     });

     if (!chat) {
       chat = await prisma.chat.create({
         data: { farmer_id, buyer_id }
       });
     }
     
     const otherId = chat.farmer_id === userId ? chat.buyer_id : chat.farmer_id;
     const otherUser = await prisma.user.findUnique({
        where: { id: otherId },
        select: { id: true, name: true, role: true, profile: { select: { profile_picture: true } } }
     });

     res.json({ ...chat, otherUser });
   } catch (error) {
     console.error('startOrGetChat error:', error);
     res.status(500).json({ error: String(error) });
   }
};

export const searchUsers = async (req: Request | any, res: Response): Promise<void> => {
    try {
        const userId = req.user?.user_id;
        const userRole = req.user?.role;
        if (!userId) { res.status(401).json({ error: 'Unauthorized' }); return; }
        
        const q = req.query.q as string;
        if (!q) { res.json([]); return; }
        
        const targetRoles = userRole === 'FARMER' ? ['BUYER', 'WAREHOUSE'] : ['FARMER'];

        const users = await prisma.user.findMany({
            where: {
                role: { in: targetRoles as any },
                name: { contains: q, mode: 'insensitive' },
                NOT: { id: userId }
            },
            select: { id: true, name: true, role: true, profile: { select: { profile_picture: true } } },
            take: 10
        });

        res.json(users);
    } catch (error) {
        res.status(500).json({ error: String(error) });
    }
};

// Connection management
export const getConnections = async (req: Request | any, res: Response): Promise<void> => {
   try {
     const targetId = req.params.userId;
     const connections = await prisma.connection.findMany({
       where: {
         OR: [{ user_id: targetId }, { connected_user_id: targetId }]
       }
     });

     const connectedIds = connections.map(c => c.user_id === targetId ? c.connected_user_id : c.user_id);
     
     const users = connectedIds.length > 0 ? await prisma.user.findMany({
       where: { id: { in: connectedIds } },
       select: { id: true, name: true, role: true, profile: { select: { profile_picture: true } } }
     }) : [];

     res.json(users);
   } catch (error) {
     console.error('getConnections error:', error);
     res.status(500).json({ error: String(error) });
   }
};

export const connectUser = async (req: Request | any, res: Response): Promise<void> => {
   try {
     const userId = req.user?.user_id;
     if (!userId) { res.status(401).json({ error: 'Unauthorized' }); return; }
     const { targetId } = req.body;

     const user1_id = userId < targetId ? userId : targetId;
     const user2_id = userId > targetId ? userId : targetId;

     const connection = await prisma.connection.upsert({
       where: { user_id_connected_user_id: { user_id: user1_id, connected_user_id: user2_id } },
       update: {},
       create: { user_id: user1_id, connected_user_id: user2_id }
     });

     res.json(connection);
   } catch (error) {
     console.error('connectUser error:', error);
     res.status(500).json({ error: String(error) });
   }
};
