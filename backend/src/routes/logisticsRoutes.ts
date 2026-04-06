import { Router } from 'express';
import {
  getJobDetails,
  markPickup,
  initiateHandover,
  confirmHandover,
  logWarehouseData,
  verifyPickupOTP,
  verifyDeliveryOTP
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

// OTP-based pickup verification (transporter enters farmer's phone)
router.post('/jobs/:token/verify-otp', verifyPickupOTP);

// OTP-based delivery verification (transporter enters warehousecollector email)
router.post('/jobs/:token/verify-delivery', verifyDeliveryOTP);

export default router;
