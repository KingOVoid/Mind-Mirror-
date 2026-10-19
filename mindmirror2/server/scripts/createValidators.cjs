const fs = require('fs');
const path = require('path');

const valDir = path.join(__dirname, '..', 'src', 'utils', 'validators');
if (!fs.existsSync(valDir)) {
  fs.mkdirSync(valDir, { recursive: true });
}

const schemas = {
  'authSchemas.ts': `import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  fullName: z.string().min(1),
  college: z.string().optional(),
  course: z.string().optional(),
  semester: z.string().optional(),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email(),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1),
  password: z.string().min(6),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
`,

  'onboardingSchemas.ts': `import { z } from 'zod';

export const onboardingSchema = z.object({
  college: z.string().optional(),
  course: z.string().optional(),
  semester: z.string().optional(),
  learningGoals: z.string().optional(),
  preferredStudyTime: z.string().optional(),
  dailyStudyTargetMinutes: z.number().optional(),
});
`,

  'questionSchemas.ts': `import { z } from 'zod';

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
`,

  'quizSchemas.ts': `import { z } from 'zod';

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
`,

  'studySessionSchemas.ts': `import { z } from 'zod';

export const startSessionSchema = z.object({
  subjectId: z.string().optional(),
  topicId: z.string().optional(),
  notes: z.string().optional(),
});

export const endSessionSchema = z.object({
  sessionId: z.string(),
  durationSec: z.number().optional(),
});
`,

  'subjectSchemas.ts': `import { z } from 'zod';

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
`,

  'testSchemas.ts': `import { z } from 'zod';

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
`,
};

for (const [filename, content] of Object.entries(schemas)) {
  const filePath = path.join(valDir, filename);
  fs.writeFileSync(filePath, content, 'utf8');
  console.log('Created validator:', filename);
}
