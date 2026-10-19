import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { validateBody } from '../middleware/validate';
import { subjectController } from '../controllers/subjectController';
import { topicController } from '../controllers/topicController';
import { createSubjectSchema, updateSubjectSchema } from '../utils/validators/subjectSchemas';

const router = Router();

router.use(requireAuth);

router.get('/', subjectController.list);
router.post('/', validateBody(createSubjectSchema), subjectController.create);
router.get('/:id', subjectController.getOne);
router.put('/:id', validateBody(updateSubjectSchema), subjectController.update);
router.delete('/:id', subjectController.remove);
router.get('/:subjectId/topics', topicController.listForSubject);

export default router;
