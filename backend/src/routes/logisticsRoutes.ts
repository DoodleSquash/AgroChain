import { Router } from 'express';
import {
  getJobDetails,
  markPickup,
  initiateHandover,
  confirmHandover,
  logWarehouseData
} from '../controllers/logisticsController';

const router = Router();

// Validate and fetch context for the logistics link
router.get('/jobs/:token', getJobDetails);

// Transport Tracking Actions
router.post('/jobs/:token/pickup', markPickup);
router.post('/jobs/:token/handoff', initiateHandover);
router.post('/receive/:handoverToken', confirmHandover);

// Warehouse Analytics Action
router.post('/jobs/:token/warehouse', logWarehouseData);

export default router;
