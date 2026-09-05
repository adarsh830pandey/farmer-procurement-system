import express from 'express';
import {
  processPayment,
  getPaymentById,
  getMyPayments,
  getPaymentReceipt,
} from '../controllers/paymentController.js';
import { optionalAuth } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/', optionalAuth, processPayment);
router.get('/my-payments', optionalAuth, getMyPayments);
router.get('/receipt/:id', getPaymentReceipt);
router.get('/:id', getPaymentById);

export default router;
