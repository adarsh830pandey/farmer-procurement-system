import express from 'express';
import {
  createFarmer,
  getFarmerById,
  updateFarmer,
  getFarmerListings,
} from '../controllers/farmerController.js';
import { optionalAuth } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/', optionalAuth, createFarmer);
router.put('/profile', optionalAuth, updateFarmer);
router.get('/:id', getFarmerById);
router.put('/:id', optionalAuth, updateFarmer);
router.get('/:id/listings', getFarmerListings);

export default router;
