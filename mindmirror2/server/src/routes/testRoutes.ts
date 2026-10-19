import { Router } from 'express';
import { requireAuth, requireRole } from '../middleware/auth';
import { validateBody } from '../middleware/validate';
import { testController } from '../controllers/testController';
import { createTestSchema, saveTestAnswerSchema, submitTestSchema } from '../utils/validators/testSchemas';

const router = Router();

router.use(requireAuth);

router.get('/', testController.list);
router.post('/', requireRole('ADMIN'), validateBody(createTestSchema), testController.create);
router.get('/history', testController.history);
router.post('/:id/start', testController.start);
router.put('/attempts/:attemptId/answer', validateBody(saveTestAnswerSchema), testController.saveAnswer);
router.post('/submit', validateBody(submitTestSchema), testController.submit);
router.get('/attempts/:attemptId/review', testController.review);

export default router;
