import { Router } from 'express';
import { handleVoiceIntent } from '../controllers/voiceController';

const router = Router();

router.post('/intent', handleVoiceIntent);

export default router;
