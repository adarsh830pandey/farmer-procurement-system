import express from 'express';
import {
  createListing,
  getListings,
  getListingById,
  updateListing,
  deleteListing,
} from '../controllers/procurementListingController.js';
import { getProcurementJourney } from '../controllers/procurementController.js';
import { optionalAuth } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Procurement Listings APIs
router.post('/listings', optionalAuth, createListing);
router.get('/listings', getListings);
router.get('/listings/:id', getListingById);
router.put('/listings/:id', optionalAuth, updateListing);
router.delete('/listings/:id', optionalAuth, deleteListing);

// Procurement Journey API for Mandi
router.get('/journey', optionalAuth, getProcurementJourney);

export default router;
