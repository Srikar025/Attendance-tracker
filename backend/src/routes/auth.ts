import { Router } from 'express';
import {
  signup,
  login,
  getMe,
  forgotPassword,
  verifyOtp,
  resetPassword,
} from '../controllers/authController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.post('/signup', signup);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/verify-otp', verifyOtp);
router.post('/reset-password', resetPassword);
router.get('/me', authMiddleware, getMe);

export default router;
