import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { validateBody } from '../middleware/validate';
import { onboardingSchema } from '../utils/validators/onboardingSchemas';
import { onboardingController } from '../controllers/onboardingController';

const router = Router();

router.get('/status', requireAuth, onboardingController.status);
router.post('/complete', requireAuth, validateBody(onboardingSchema), onboardingController.complete);

export default router;
