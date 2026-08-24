import express from 'express';
import { updateFarmerProfile } from '../controllers/authController.js';
import { optionalAuth } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.put('/profile', optionalAuth, updateFarmerProfile);

export default router;
