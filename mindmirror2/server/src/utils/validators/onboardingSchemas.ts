import { z } from 'zod';

export const onboardingSchema = z.object({
  college: z.string().optional(),
  course: z.string().optional(),
  semester: z.string().optional(),
  learningGoals: z.string().optional(),
  preferredStudyTime: z.string().optional(),
  dailyStudyTargetMinutes: z.number().optional(),
});
