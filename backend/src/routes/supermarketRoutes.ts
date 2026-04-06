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
  getConsumerQRs,
  updateLogisticsJob,
  deleteLogisticsJob,
  sendLogisticsEmail,
  getFarmers
} from '../controllers/supermarketController';
import { authMiddleware } from '../middlewares/authMiddleware';

import {
  getWarehouses,
  createWarehouse,
  deleteWarehouse,
  addWorker,
  removeWorker,
  importWorkersCSV
} from '../controllers/warehouseController';
import {
  getTransporters,
  createTransporter,
  deleteTransporter
} from '../controllers/transporterController';

const router = Router();

// Onboarding / Auth
router.post('/register', register);
router.post('/login', login);
router.post('/verify-otp', verifyOTP);

// Public marketplace browsing (no auth required)
router.get('/marketplace', getMarketplace);
router.get('/marketplace/:id', getListingDetails);
router.get('/farmers', getFarmers);

import { updateProfile } from '../controllers/publicController';

// Protected Routes (Requires Auth)
router.use(authMiddleware);

router.put('/profile', updateProfile);

// Dashboard
router.get('/dashboard', getDashboard);

// Warehouses
router.get('/warehouses', getWarehouses);
router.post('/warehouses', createWarehouse);
router.delete('/warehouses/:id', deleteWarehouse);
router.post('/warehouses/workers', addWorker);
router.delete('/warehouses/workers/:id', removeWorker);
router.post('/warehouses/workers/csv', importWorkersCSV);

// Transporters
router.get('/transporters', getTransporters);
router.post('/transporters', createTransporter);
router.delete('/transporters/:id', deleteTransporter);

// Orders
router.post('/orders', placeOrder);
router.post('/orders/:id/pay', payOrder); // Mock payment + escrow trigger
router.get('/orders', getOrders);
router.get('/orders/:id', getOrderDetails);
router.get('/consumer-qrs', getConsumerQRs);

// Logistics Generation & Management
router.post('/orders/:id/logistics', generateLogisticsToken);
router.post('/logistics/:jobId/send-email', sendLogisticsEmail);
router.put('/logistics/:jobId', updateLogisticsJob);
router.delete('/logistics/:jobId', deleteLogisticsJob);

export default router;
