import { Router } from 'express';
import { getTrace } from '../controllers/publicController';

const router = Router();

// Publicly accessible QR trace endpoint
router.get('/trace/:batchId', getTrace);

export default router;
