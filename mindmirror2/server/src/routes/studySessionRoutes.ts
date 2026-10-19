import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { validateBody } from '../middleware/validate';
import { studySessionController } from '../controllers/studySessionController';
import { startSessionSchema, pauseSessionSchema, finishSessionSchema } from '../utils/validators/studySessionSchemas';

const router = Router();

router.use(requireAuth);

router.get('/active', studySessionController.getActive);
router.get('/', studySessionController.history);
router.post('/', validateBody(startSessionSchema), studySessionController.start);
router.put('/:id/pause', validateBody(pauseSessionSchema), studySessionController.pause);
router.put('/:id/finish', validateBody(finishSessionSchema), studySessionController.finish);

export default router;
