import type { Request, Response } from 'express';
import { asyncHandler, AppError } from '../utils/AppError';
import { pool } from '../db/pool';

export const searchController = {
  search: asyncHandler(async (req: Request, res: Response) => {
    const q = (req.query.q as string)?.trim();
    if (!q || q.length < 2) throw AppError.badRequest('Query must be at least 2 characters');
    const userId = req.user!.id;
    const like = `%${q}%`;

    const [subjects, topics, questions, mistakes] = await Promise.all([
      pool.query(
        `SELECT id, name, description FROM "Subject"
         WHERE (name ILIKE $2 OR description ILIKE $2) AND ("isGlobal" = true OR "ownerId" = $1) LIMIT 10`,
        [userId, like]
      ),
      pool.query(
        `SELECT t.id, t.name, t."subjectId", s.name AS "subjectName" FROM "Topic" t
         JOIN "Subject" s ON s.id = t."subjectId"
         WHERE t.name ILIKE $2 AND (s."isGlobal" = true OR s."ownerId" = $1) LIMIT 10`,
        [userId, like]
      ),
      pool.query(
        // Only questions the student could legitimately see context for (their subjects); answer key excluded.
        `SELECT q.id, q.text, q."topicId", q."subjectId", q.difficulty FROM "Question" q
         JOIN "Subject" s ON s.id = q."subjectId"
         WHERE q.text ILIKE $2 AND q."isActive" = true AND (s."isGlobal" = true OR s."ownerId" = $1) LIMIT 10`,
        [userId, like]
      ),
      pool.query(
        `SELECT m.id, m."questionId", q.text, t.name AS "topicName" FROM "Mistake" m
         JOIN "Question" q ON q.id = m."questionId"
         JOIN "Topic" t ON t.id = m."topicId"
         WHERE m."userId" = $1 AND q.text ILIKE $2 LIMIT 10`,
        [userId, like]
      ),
    ]);

    res.json({
      subjects: subjects.rows,
      topics: topics.rows,
      questions: questions.rows,
      mistakes: mistakes.rows,
    });
  }),
};
