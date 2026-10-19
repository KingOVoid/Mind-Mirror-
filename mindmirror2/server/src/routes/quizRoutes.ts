import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { validateBody } from '../middleware/validate';
import { quizController } from '../controllers/quizController';
import { generateQuizSchema, generatePersonalizedQuizSchema, submitQuizSchema } from '../utils/validators/quizSchemas';

const router = Router();

router.use(requireAuth);

router.get('/history', quizController.history);
router.post('/', validateBody(generateQuizSchema), quizController.create);
router.post('/personalized', validateBody(generatePersonalizedQuizSchema), quizController.createPersonalized);
router.get('/:id', quizController.getOne);
router.post('/submit', validateBody(submitQuizSchema), quizController.submit);
router.get('/attempts/:attemptId/review', quizController.review);

export default router;
