import { z } from 'zod';

export const createSubjectSchema = z.object({
  name: z.string(),
  description: z.string().optional(),
  icon: z.string().optional(),
});

export const createTopicSchema = z.object({
  subjectId: z.string(),
  name: z.string(),
  description: z.string().optional(),
  parentId: z.string().optional(),
});
