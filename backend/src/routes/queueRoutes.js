import express from 'express';
import { getMyQueueStatus, getCentreQueue } from '../controllers/queueController.js';
import { optionalAuth } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/my-status', optionalAuth, getMyQueueStatus);
router.get('/live', getCentreQueue);

export default router;
