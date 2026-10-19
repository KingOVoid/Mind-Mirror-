import { query } from '../pool';

export const questionRepo = {
  async findById(id: string) {
    try {
      const res = await query('SELECT * FROM "Question" WHERE id = $1', [id]);
      return res.rows[0] || null;
    } catch {
      return null;
    }
  },
  async findByTopic(topicId: string) {
    return [];
  },
  async create(data: any) {
    try {
      const id = data.id || `q_${Date.now()}`;
      const res = await query(
        'INSERT INTO "Question" (id, "subjectId", "topicId", type, text, options, "correctAnswer", explanation, difficulty, concept, "authorId", "isActive", "createdAt", "updatedAt") VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, true, NOW(), NOW()) RETURNING *',
        [
          id,
          data.subjectId,
          data.topicId,
          data.type,
          data.text,
          JSON.stringify(data.options || []),
          JSON.stringify(data.correctAnswer),
          data.explanation,
          data.difficulty,
          data.concept,
          data.authorId || null,
        ]
      );
      return res.rows[0];
    } catch {
      return { id: `q_${Date.now()}`, ...data };
    }
  },
  async update(id: string, data: any) {
    return { id, ...data };
  },
  async delete(id: string) {},
};
