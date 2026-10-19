import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { recommendationController } from '../controllers/recommendationController';

const router = Router();

router.use(requireAuth);

router.get('/', recommendationController.list);
router.post('/regenerate', recommendationController.regenerate);
router.put('/:id/dismiss', recommendationController.dismiss);

export default router;
