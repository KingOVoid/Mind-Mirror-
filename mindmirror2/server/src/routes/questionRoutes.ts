import { Router } from 'express';
import { requireAuth, requireRole } from '../middleware/auth';
import { validateBody } from '../middleware/validate';
import { questionController } from '../controllers/questionController';
import { createQuestionSchema, updateQuestionSchema } from '../utils/validators/questionSchemas';

const router = Router();

router.use(requireAuth);

router.get('/', requireRole('ADMIN'), questionController.listBySubject);
router.post('/', requireRole('ADMIN'), validateBody(createQuestionSchema), questionController.create);
router.put('/:id', requireRole('ADMIN'), validateBody(updateQuestionSchema), questionController.update);
router.delete('/:id', requireRole('ADMIN'), questionController.remove);

export default router;
