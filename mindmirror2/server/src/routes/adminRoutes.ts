import { Router } from 'express';
import { requireAuth, requireRole } from '../middleware/auth';
import { validateBody } from '../middleware/validate';
import { adminController } from '../controllers/adminController';
import { createSubjectSchema, createTopicSchema } from '../utils/validators/subjectSchemas';

const router = Router();

// Every route here requires authentication AND the ADMIN role, checked on
// the server — never trusting a frontend-only role check.
router.use(requireAuth, requireRole('ADMIN'));

router.get('/students', adminController.listStudents);
router.get('/students/:id', adminController.getStudent);
router.get('/stats', adminController.stats);
router.get('/difficult-questions', adminController.difficultQuestions);
router.get('/weak-topics', adminController.weakTopics);
router.post('/subjects', validateBody(createSubjectSchema), adminController.createGlobalSubject);
router.post('/topics', validateBody(createTopicSchema), adminController.createGlobalTopic);

export default router;
