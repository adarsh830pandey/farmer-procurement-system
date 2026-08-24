import express from 'express';
import { registerFarmer, loginFarmer, loginAdmin, getMe } from '../controllers/authController.js';
import { protect, optionalAuth } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/register', registerFarmer);
router.post('/login', loginFarmer);
router.post('/admin-login', loginAdmin);
router.get('/me', protect, getMe);

export default router;
