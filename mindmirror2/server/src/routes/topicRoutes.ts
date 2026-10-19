import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { validateBody } from '../middleware/validate';
import { topicController } from '../controllers/topicController';
import { createTopicSchema, updateTopicSchema } from '../utils/validators/subjectSchemas';

const router = Router();

router.use(requireAuth);

router.post('/', validateBody(createTopicSchema), topicController.create);
router.put('/:id', validateBody(updateTopicSchema), topicController.update);
router.delete('/:id', topicController.remove);

export default router;
