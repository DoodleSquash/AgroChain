import { Router } from 'express';
import {
  register,
  login,
  verifyOTP,
  getDashboard,
  createListing,
  getListings,
  updateListing,
  deleteListing,
  getOrders,
  getOrderDetails,
  getPayments,
  getQR
} from '../controllers/farmerController';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = Router();

// Onboarding / Auth
router.post('/register', register);
router.post('/login', login);
router.post('/verify-otp', verifyOTP);

// Protected Dashboard & Listings (Requires Auth)
router.use(authMiddleware);

router.get('/dashboard', getDashboard);

// Listings (Batches)
router.post('/batches', createListing);
router.get('/batches', getListings);
router.put('/batches/:id', updateListing);
router.delete('/batches/:id', deleteListing);

// QR Fetch
router.get('/batches/:id/qr', getQR);

// Orders
router.get('/orders', getOrders);
router.get('/orders/:id', getOrderDetails);

// Payments Dashboard
router.get('/payments', getPayments);

export default router;
