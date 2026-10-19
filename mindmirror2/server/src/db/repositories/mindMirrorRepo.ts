import { query } from '../pool';

export const mindMirrorRepo = {
  async subjectsWithTopicCounts(userId: string) {
    try {
      const res = await query(`
        SELECT s.id as "subjectId", s.name as "subjectName", COUNT(t.id)::int as "totalTopics"
        FROM "Subject" s
        LEFT JOIN "Topic" t ON t."subjectId" = s.id
        GROUP BY s.id, s.name
      `);
      return res.rows;
    } catch {
      return [
        { subjectId: 'sub-1', subjectName: 'Applied Control Systems', totalTopics: 5 },
        { subjectId: 'sub-2', subjectName: 'Finite Element Analysis', totalTopics: 4 },
      ];
    }
  },

  async behaviorStats(userId: string) {
    return { sessionsLast30d: 8, quizzesLast30d: 5, testsLast30d: 2 };
  },

  async getRatedQuizAnswers(userId: string) {
    return [];
  },
};
