import { z } from 'zod';

export const startSessionSchema = z.object({
  subjectId: z.string().optional(),
  topicId: z.string().optional(),
  notes: z.string().optional(),
});

export const endSessionSchema = z.object({
  sessionId: z.string(),
  durationSec: z.number().optional(),
});
