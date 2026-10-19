import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { dashboardController } from '../controllers/dashboardController';

const router = Router();

router.get('/', requireAuth, dashboardController.get);

export default router;
