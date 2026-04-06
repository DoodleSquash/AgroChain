import { Router } from 'express';
import { getTrace, getHiringJobPublic, applyToHiringJob, getUserProfile } from '../controllers/publicController';

const router = Router();

// Publicly accessible QR trace endpoint
router.get('/trace/:batchId', getTrace);

// Publicly accessible Hiring endpoints
router.get('/hiring/:id', getHiringJobPublic);
router.post('/hiring/apply', applyToHiringJob);

// Publicly accessible Profile endpoint
router.get('/profile/:id', getUserProfile);

// Publicly accessible Utility endpoints
import { getFarmerTypes } from '../controllers/publicController';
router.get('/farmer-types', getFarmerTypes);

export default router;
