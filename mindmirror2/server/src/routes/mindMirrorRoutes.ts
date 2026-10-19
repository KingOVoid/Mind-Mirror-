import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { mindMirrorController } from '../controllers/mindMirrorController';

const router = Router();

router.get('/', requireAuth, mindMirrorController.get);

export default router;
