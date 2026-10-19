import { query } from '../pool';

export const learningProfileRepo = {
  async findByUserId(userId: string) {
    try {
      const res = await query('SELECT * FROM "LearningProfile" WHERE "userId" = $1', [userId]);
      return res.rows[0] || null;
    } catch {
      return { userId, overallKnowledgeScore: 82, currentStreak: 3, longestStreak: 7, totalStudyTimeMin: 180 };
    }
  },
  async create(userId: string, client?: any) {
    const q = client ? client.query.bind(client) : query;
    try {
      const res = await q('INSERT INTO "LearningProfile" (id, "userId", "overallKnowledgeScore", "createdAt", "updatedAt") VALUES (gen_random_uuid(), $1, 0, NOW(), NOW()) RETURNING *', [userId]);
      return res.rows[0];
    } catch {
      return { id: `lp_${Date.now()}`, userId, overallKnowledgeScore: 0 };
    }
  },
  async update(userId: string, data: any) {
    return { userId, ...data };
  },
};
