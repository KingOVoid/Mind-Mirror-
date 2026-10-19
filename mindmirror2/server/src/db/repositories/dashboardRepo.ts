import { query } from '../pool';

export const dashboardRepo = {
  async topicProgressWithNames(userId: string) {
    try {
      const res = await query(`
        SELECT tp.*, t.name as "topicName", s.name as "subjectName"
        FROM "TopicProgress" tp
        JOIN "Topic" t ON tp."topicId" = t.id
        JOIN "Subject" s ON tp."subjectId" = s.id
        WHERE tp."userId" = $1
      `, [userId]);
      return res.rows;
    } catch {
      return [];
    }
  },
  async getRecentActivity(userId: string) {
    return [];
  },
};
