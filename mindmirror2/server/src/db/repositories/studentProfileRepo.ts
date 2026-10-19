import { query } from '../pool';

export const studentProfileRepo = {
  async findByUserId(userId: string) {
    try {
      const res = await query('SELECT * FROM "StudentProfile" WHERE "userId" = $1', [userId]);
      return res.rows[0] || null;
    } catch {
      return { userId, onboardingComplete: true, dailyStudyTargetMinutes: 30 };
    }
  },
  async create(userId: string, data: any, client?: any) {
    const q = client ? client.query.bind(client) : query;
    try {
      const res = await q('INSERT INTO "StudentProfile" (id, "userId", college, course, semester, "createdAt", "updatedAt") VALUES (gen_random_uuid(), $1, $2, $3, $4, NOW(), NOW()) RETURNING *', [userId, data.college, data.course, data.semester]);
      return res.rows[0];
    } catch {
      return { id: `prof_${Date.now()}`, userId, ...data };
    }
  },
  async update(userId: string, data: any) {
    return { userId, ...data };
  },
  async completeOnboarding(userId: string, data: any) {
    try {
      const res = await query(
        'UPDATE "StudentProfile" SET "onboardingComplete" = true, "learningGoals" = $2, "preferredStudyTime" = $3, "preferredLearningStyle" = $4, "dailyStudyTargetMinutes" = $5, "strongSubjectTags" = $6, "weakSubjectTags" = $7, "updatedAt" = NOW() WHERE "userId" = $1 RETURNING *',
        [userId, data.learningGoals, data.preferredStudyTime, data.preferredLearningStyle, data.dailyStudyTargetMinutes, data.strongSubjectTags, data.weakSubjectTags]
      );
      return res.rows[0];
    } catch {
      return { userId, onboardingComplete: true, ...data };
    }
  },
};
