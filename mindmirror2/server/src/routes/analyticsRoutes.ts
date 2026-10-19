import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { analyticsController } from '../controllers/analyticsController';

const router = Router();

router.get('/', requireAuth, analyticsController.get);

export default router;
