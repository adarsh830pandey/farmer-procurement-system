import express from 'express';
import { getProcurementJourney } from '../controllers/procurementController.js';
import { optionalAuth } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/journey', optionalAuth, getProcurementJourney);

export default router;
