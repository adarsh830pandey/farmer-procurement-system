import express from 'express';
import {
  getDistricts,
  getCentres,
  getAvailableSlots,
  bookSlot,
  getMyBookings,
} from '../controllers/slotController.js';
import { protect, optionalAuth } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/districts', getDistricts);
router.get('/centres', getCentres);
router.get('/available', getAvailableSlots);
router.post('/book', optionalAuth, bookSlot);
router.get('/my-bookings', optionalAuth, getMyBookings);

export default router;
