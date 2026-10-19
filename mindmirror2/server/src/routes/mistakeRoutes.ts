import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { mistakeController } from '../controllers/mistakeController';

const router = Router();

router.use(requireAuth);

router.get('/', mistakeController.list);
router.post('/practice', mistakeController.practiceMistakes);

export default router;
