import { Router } from 'express';
import { requireAuth, optionalAuth } from '../middleware/auth';
import { aiController } from '../controllers/aiController';

const router = Router();

// Public/Optional routes
router.get('/presets', optionalAuth, aiController.engineeringPresets);
router.post('/copilot', optionalAuth, aiController.copilotChat);
router.post('/chat', optionalAuth, aiController.copilotChat);
router.post('/explain-answer', optionalAuth, aiController.explainAnswer);
router.post('/engineering-study-plan', optionalAuth, aiController.engineeringStudyPlan);
router.post('/analyze-document', optionalAuth, aiController.analyzeDocument);
router.post('/generate-quiz', optionalAuth, aiController.generateQuiz);

// Protected routes
router.use(requireAuth);

router.get('/status', aiController.status);
router.post('/study-plan', aiController.studyPlan);
router.post('/summarize-weak-topics', aiController.summarizeWeakTopics);

export default router;
