import { z } from 'zod';

export const createTestSchema = z.object({
  subjectId: z.string(),
  title: z.string(),
  instructions: z.string().optional(),
  difficulty: z.enum(['EASY', 'MEDIUM', 'HARD']).optional(),
  timeLimitMin: z.number().optional(),
});

export const submitTestSchema = z.object({
  attemptId: z.string(),
  answers: z.array(z.object({
    questionId: z.string(),
    selectedAnswer: z.any(),
    timeSpentMs: z.number().optional(),
    markedForReview: z.boolean().optional(),
  })).optional(),
});
