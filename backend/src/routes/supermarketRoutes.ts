import { Router } from 'express';
import {
  register,
  login,
  verifyOTP,
  getDashboard,
  getMarketplace,
  getListingDetails,
  placeOrder,
  payOrder,
  getOrders,
  getOrderDetails,
  generateLogisticsToken,
  getConsumerQRs
} from '../controllers/supermarketController';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = Router();

// Onboarding / Auth
router.post('/register', register);
router.post('/login', login);
router.post('/verify-otp', verifyOTP);

// Public marketplace browsing (no auth required)
router.get('/marketplace', getMarketplace);
router.get('/marketplace/:id', getListingDetails);

// Protected Routes (Requires Auth)
router.use(authMiddleware);

// Dashboard
router.get('/dashboard', getDashboard);

// Orders
router.post('/orders', placeOrder);
router.post('/orders/:id/pay', payOrder); // Mock payment + escrow trigger
router.get('/orders', getOrders);
router.get('/orders/:id', getOrderDetails);
router.get('/consumer-qrs', getConsumerQRs);

// Logistics Generation
router.post('/orders/:id/logistics', generateLogisticsToken);

export default router;
