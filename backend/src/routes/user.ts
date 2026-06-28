import { Router } from 'express';
import { updateProfile, updateTotals } from '../controllers/userController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.use(authMiddleware);

router.put('/profile', updateProfile);
router.put('/totals', updateTotals);

export default router;
