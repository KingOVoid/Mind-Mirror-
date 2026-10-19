import { Router } from 'express';
import { z } from 'zod';
import { requireAuth } from '../middleware/auth';
import { validateBody } from '../middleware/validate';
import { profileController } from '../controllers/profileController';

const updateProfileSchema = z.object({
  college: z.string().trim().max(200).optional(),
  course: z.string().trim().max(200).optional(),
  semester: z.string().trim().max(50).optional(),
  learningGoals: z.string().trim().max(1000).optional(),
});

const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Password must contain an uppercase letter')
      .regex(/[a-z]/, 'Password must contain a lowercase letter')
      .regex(/[0-9]/, 'Password must contain a number'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

const router = Router();

router.put('/', requireAuth, validateBody(updateProfileSchema), profileController.update);
router.put('/password', requireAuth, validateBody(changePasswordSchema), profileController.changePassword);

export default router;
