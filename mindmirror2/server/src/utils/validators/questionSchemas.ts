import { z } from 'zod';

export const createQuestionSchema = z.object({
  subjectId: z.string(),
  topicId: z.string(),
  text: z.string(),
  type: z.enum(['MULTIPLE_CHOICE', 'TRUE_FALSE', 'MULTIPLE_SELECT', 'FILL_IN_BLANK']).optional(),
  options: z.any().optional(),
  correctAnswer: z.any(),
  explanation: z.string().optional(),
  difficulty: z.enum(['EASY', 'MEDIUM', 'HARD']).optional(),
  concept: z.string().optional(),
});

export const updateQuestionSchema = createQuestionSchema.partial();
