import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { reviewCenterController } from '../controllers/reviewCenterController';

const router = Router();

router.use(requireAuth);

router.get('/', reviewCenterController.get);
router.post('/start', reviewCenterController.startRevision);

export default router;
