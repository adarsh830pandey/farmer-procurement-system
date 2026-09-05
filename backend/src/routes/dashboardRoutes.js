import express from 'express';
import {
  getFarmerDashboard,
  getBuyerDashboard,
  getAdminDashboard,
} from '../controllers/dashboardController.js';
import { optionalAuth } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/farmer', optionalAuth, getFarmerDashboard);
router.get('/buyer', optionalAuth, getBuyerDashboard);
router.get('/admin', getAdminDashboard);

export default router;
