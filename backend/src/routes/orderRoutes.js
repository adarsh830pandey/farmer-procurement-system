import express from 'express';
import {
  createOrder,
  getOrders,
  getOrderById,
  updateOrderStatus,
} from '../controllers/orderController.js';
import { getPaymentByOrder } from '../controllers/paymentController.js';
import { optionalAuth } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/', optionalAuth, createOrder);
router.get('/', optionalAuth, getOrders);
router.get('/:id', getOrderById);
router.put('/:id/status', optionalAuth, updateOrderStatus);
router.get('/:id/payment', getPaymentByOrder);

export default router;
