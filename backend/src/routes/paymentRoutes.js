import express from 'express';
import { getMyPayments, getPaymentReceipt } from '../controllers/paymentController.js';
import { optionalAuth } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/my-payments', optionalAuth, getMyPayments);
router.get('/receipt/:id', getPaymentReceipt);

export default router;
