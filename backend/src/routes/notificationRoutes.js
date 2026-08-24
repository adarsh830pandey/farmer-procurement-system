import express from 'express';
import { getNotifications, markNotificationRead } from '../controllers/notificationController.js';
import { protect, optionalAuth } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/', optionalAuth, getNotifications);
router.put('/:id/read', protect, markNotificationRead);

export default router;
