import { Router } from 'express';
import {
  createDailyRecord,
  getDailyRecord,
  updateDailyRecord,
  getHistory,
  getStats,
} from '../controllers/attendanceController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.use(authMiddleware);

router.post('/daily', createDailyRecord);
router.get('/daily', getDailyRecord);
router.put('/daily/:id', updateDailyRecord);
router.get('/history', getHistory);
router.get('/stats', getStats);

export default router;
