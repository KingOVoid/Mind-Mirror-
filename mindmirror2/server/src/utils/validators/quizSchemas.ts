import { z } from 'zod';

export const createQuizSchema = z.object({
  subjectId: z.string(),
  title: z.string().optional(),
  difficulty: z.enum(['EASY', 'MEDIUM', 'HARD']).optional(),
});

export const submitQuizSchema = z.object({
  attemptId: z.string(),
  answers: z.array(z.object({
    questionId: z.string(),
    selectedAnswer: z.any(),
    timeSpentMs: z.number().optional(),
    confidenceRating: z.number().optional(),
  })).optional(),
});
