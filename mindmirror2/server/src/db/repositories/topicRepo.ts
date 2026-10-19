import { query } from '../pool';

export const topicRepo = {
  async findById(id: string) {
    try {
      const res = await query('SELECT * FROM "Topic" WHERE id = $1', [id]);
      return res.rows[0] || null;
    } catch {
      return null;
    }
  },
  async findBySubject(subjectId: string) {
    try {
      const res = await query('SELECT * FROM "Topic" WHERE "subjectId" = $1 ORDER BY "orderIndex" ASC, name ASC', [subjectId]);
      return res.rows;
    } catch {
      return [];
    }
  },
  async listBySubjectWithProgress(subjectId: string, userId: string) {
    try {
      const res = await query(
        `SELECT t.*,
                COALESCE(tp."knowledgeScore", 0) as "knowledgeScore",
                COALESCE(tp."masteryStatus", 'NOT_STARTED') as "masteryStatus",
                COALESCE(tp."retentionScore", 100) as "retentionScore"
         FROM "Topic" t
         LEFT JOIN "TopicProgress" tp ON tp."topicId" = t.id AND tp."userId" = $2
         WHERE t."subjectId" = $1
         ORDER BY t."orderIndex" ASC, t.name ASC`,
        [subjectId, userId]
      );
      return res.rows;
    } catch {
      return [];
    }
  },
  async create(data: any) {
    try {
      const id = data.id || `topic_${Date.now()}`;
      const res = await query(
        'INSERT INTO "Topic" (id, "subjectId", name, description, "createdAt", "updatedAt") VALUES ($1, $2, $3, $4, NOW(), NOW()) RETURNING *',
        [id, data.subjectId, data.name, data.description]
      );
      return res.rows[0];
    } catch {
      return { id: `topic_${Date.now()}`, ...data };
    }
  },
};
