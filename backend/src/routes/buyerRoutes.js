import express from 'express';
import { getAllBuyers, getBuyerById } from '../controllers/buyerController.js';

const router = express.Router();

router.get('/', getAllBuyers);
router.get('/:id', getBuyerById);

export default router;
