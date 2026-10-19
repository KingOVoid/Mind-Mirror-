import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { notificationController } from '../controllers/notificationController';

const router = Router();

router.use(requireAuth);

router.get('/', notificationController.list);
router.put('/:id/read', notificationController.markRead);
router.put('/read-all', notificationController.markAllRead);

export default router;
