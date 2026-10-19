import { pool } from './src/db/pool';
import { recomputeLearningProfile } from './src/services/learningProfileService';

async function main() {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const studentResult = await client.query(
      `SELECT id, "fullName"
       FROM "User"
       WHERE email = $1 AND role = 'STUDENT'`,
      ['student@mindmirror.dev']
    );

    if (studentResult.rows.length === 0) {
      throw new Error('Student account not found.');
    }

    const userId = studentResult.rows[0].id;

    const existingDemo = await client.query(
      `SELECT id FROM "StudySession"
       WHERE "userId" = $1
         AND notes LIKE 'DEMO DATA: Mind Mirror showcase%'
       LIMIT 1`,
      [userId]
    );

    if (existingDemo.rows.length > 0) {
      throw new Error(
        'Demo sessions already exist. Stopping to avoid duplicate data.'
      );
    }

    const existingProgress = await client.query(
      `SELECT id FROM "TopicProgress" WHERE "userId" = $1 LIMIT 1`,
      [userId]
    );

    if (existingProgress.rows.length > 0) {
      throw new Error(
        'Topic progress already exists. Stopping to protect existing data.'
      );
    }

    const topics = await client.query(
      `SELECT s.id AS "subjectId", t.id AS "topicId", t.name
       FROM "Subject" s
       JOIN "Topic" t ON t."subjectId" = s.id
       WHERE s."isGlobal" = true
       ORDER BY s.name, t."orderIndex"
       LIMIT 5`
    );

    if (topics.rows.length < 5) {
      throw new Error('Not enough topics were found.');
    }

    const sessionMinutes = [45, 60, 50, 75, 60];

    for (let i = 0; i < 5; i++) {
      const day = new Date();
      day.setDate(day.getDate() - (4 - i));
      day.setHours(18, 0, 0, 0);

      const startedAt = day;
      const endedAt = new Date(
        startedAt.getTime() + sessionMinutes[i] * 60 * 1000
      );

      await client.query(
        `INSERT INTO "StudySession"
         (id, "userId", "subjectId", "topicId", "startedAt",
          "endedAt", "durationSec", "isActive", notes)
         VALUES
         (gen_random_uuid(), $1, $2, $3, $4, $5, $6, false, $7)`,
        [
          userId,
          topics.rows[i].subjectId,
          topics.rows[i].topicId,
          startedAt,
          endedAt,
          sessionMinutes[i] * 60,
          `DEMO DATA: Mind Mirror showcase - sample session ${i + 1}`
        ]
      );

      await client.query(
        `INSERT INTO "TopicProgress"
         (id, "userId", "subjectId", "topicId",
          attempts, "correctAnswers", "incorrectAnswers", accuracy,
          "avgResponseTimeMs", "avgConfidence", "confidenceCalibration",
          "knowledgeScore", "avgDifficultyWeight", "difficultyLevel",
          "masteryStatus", "retentionStatus", "retentionScore",
          "revisionCount", "successfulRecalls", "lastStudiedAt",
          "lastAssessedAt", "createdAt", "updatedAt")
         VALUES
         (gen_random_uuid(), $1, $2, $3,
          10, 8, 2, 80, 12000, 4, 0,
          75, 1, 'MEDIUM', 'IMPROVING', 'STABLE', 85,
          1, 8, $4, $4, $4, $4))`,
        [userId, topics.rows[i].subjectId, topics.rows[i].topicId, endedAt]
      );
    }

    await client.query('COMMIT');
    console.log('Demo study sessions and topic progress created.');
    console.log('These are sample testing records, not real past activity.');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Demo setup failed; changes were rolled back.', error);
    process.exitCode = 1;
  } finally {
    client.release();
    await pool.end();
  }
}

main();