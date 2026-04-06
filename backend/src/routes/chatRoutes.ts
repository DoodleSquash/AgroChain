import { Router } from 'express';
import { getChats, getMessages, startOrGetChat, getConnections, connectUser, searchUsers } from '../controllers/chatController';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = Router();

router.use(authMiddleware);

// Specific paths first (before any :param routes)
router.get('/', getChats);
router.post('/start', startOrGetChat);
router.get('/search', searchUsers);
router.get('/connections/:userId', getConnections);
router.post('/connect', connectUser);

// Wildcard param routes last
router.get('/:chatId/messages', getMessages);

export default router;
