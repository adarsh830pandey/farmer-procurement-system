import express from 'express';
import { getDashboardStats, getFarmersList } from '../controllers/adminController.js';
import { getAllSlots } from '../controllers/slotController.js';
import { getAdminQueue, updateTokenStatus } from '../controllers/queueController.js';
import { recordProcurement, getProcurementRecords } from '../controllers/procurementController.js';
import { getAllPayments, updatePaymentStatus } from '../controllers/paymentController.js';
import { optionalAuth } from '../middlewares/authMiddleware.js';

const router = express.Router();

// All admin endpoints (support optionalAuth / protect in testing & production)
router.get('/stats', getDashboardStats);
router.get('/farmers', getFarmersList);
router.get('/slots', getAllSlots);
router.get('/queue', getAdminQueue);
router.put('/queue/:tokenId/status', updateTokenStatus);
router.post('/procurement/record', recordProcurement);
router.get('/procurement/records', getProcurementRecords);
router.get('/payments', getAllPayments);
router.put('/payments/:id', updatePaymentStatus);

export default router;
