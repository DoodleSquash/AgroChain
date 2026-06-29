import { Router } from 'express';
import multer from 'multer';
import { handleVoiceIntent, handleVoiceTranscribe } from '../controllers/voiceController';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post('/intent', handleVoiceIntent);
router.post('/transcribe', upload.single('file'), handleVoiceTranscribe);

export default router;
