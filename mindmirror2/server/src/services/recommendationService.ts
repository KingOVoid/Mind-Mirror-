import { pool } from '../db/pool';
import { dashboardRepo } from '../db/repositories/dashboardRepo';
import { recommendationRepo } from '../db/repositories/recommendationRepo';
import { withLiveRetention } from './topicProgressService';

interface Candidate {
  type: string;
  title: string;
  message: string;
  subjectId?: string | null;
  topicId?: string | null;
  priority: number; // 1 (low) - 5 (high)
}

/**
 * Builds a fresh list of recommendation candidates purely from the
 * student's current data — no fixed/canned content, every message is
 * parameterized by real topic names and real numbers pulled from the DB.
 */
async function buildCandidates(userId: string): Promise<Candidate[]> {
  const candidates: Candidate[] = [];

  const rawTopics = await dashboardRepo.topicProgressWithNames(userId);
  const liveTopics = rawTopics.map((t: any) => withLiveRetention(t));

  for (const t of liveTopics) {
    if (t.attempts === 0) continue;

    // 1. Forgetting / at-risk revision nudge — highest priority, this is the
    //    core "which topics are being forgotten" signal.
    if (t.retentionStatus === 'LIKELY_FORGOTTEN') {
      candidates.push({
        type: 'FORGETTING',
        title: `Revise ${t.topicName} now`,
        message: `You're likely to have forgotten most of ${t.topicName} (${t.subjectName}). A quick revision now will reset your retention before it decays further.`,
        subjectId: t.subjectId,
        topicId: t.topicId,
        priority: 5,
      });
    } else if (t.retentionStatus === 'AT_RISK' || t.masteryStatus === 'AT_RISK') {
      candidates.push({
        type: 'FORGETTING',
        title: `Review ${t.topicName} soon`,
        message: `${t.topicName} is starting to fade from memory. Revisit it in the next day or two to keep it fresh.`,
        subjectId: t.subjectId,
        topicId: t.topicId,
        priority: 4,
      });
    }

    // 2. Overconfidence / misconception detector.
    if ((t.confidenceCalibration ?? 0) > 0.3 && t.accuracy < 60 && t.attempts >= 2) {
      candidates.push({
        type: 'CONFIDENCE_GAP',
        title: `Possible misconception in ${t.topicName}`,
        message: `Your confidence is high but your accuracy (${Math.round(t.accuracy)}%) is low in ${t.topicName}. Review the concept before attempting another test.`,
        subjectId: t.subjectId,
        topicId: t.topicId,
        priority: 5,
      });
    }

    // 3. "Haven't revised in N days" nudge (only if not already flagged as forgotten/at-risk above).
    if (t.lastStudiedAt && t.retentionStatus !== 'LIKELY_FORGOTTEN' && t.retentionStatus !== 'AT_RISK') {
      const daysSince = Math.floor((Date.now() - new Date(t.lastStudiedAt).getTime()) / (1000 * 60 * 60 * 24));
      if (daysSince >= 7) {
        candidates.push({
          type: 'REVISE_TOPIC',
          title: `${daysSince} days since you studied ${t.topicName}`,
          message: `You haven't revised ${t.topicName} in ${daysSince} days. A short review session will help retention.`,
          subjectId: t.subjectId,
          topicId: t.topicId,
          priority: 3,
        });
      }
    }

    // 4. Encourage harder difficulty when doing consistently well.
    if ((t.masteryStatus === 'STRONG' || t.masteryStatus === 'MASTERED') && t.accuracy >= 85 && t.attempts >= 3) {
      candidates.push({
        type: 'DIFFICULTY_UP',
        title: `Ready for a harder challenge in ${t.topicName}`,
        message: `You're performing well in ${t.topicName} (${Math.round(t.accuracy)}% accuracy). Try a harder quiz to keep growing.`,
        subjectId: t.subjectId,
        topicId: t.topicId,
        priority: 2,
      });
    }
  }

  // 5. Frequently-wrong topics from the Mistake table.
  const { rows: mistakeTopics } = await pool.query(
    `SELECT m."topicId", t.name AS "topicName", t."subjectId", SUM(m."timesWrong")::int AS "totalWrong"
     FROM "Mistake" m
     JOIN "Topic" t ON t.id = m."topicId"
     WHERE m."userId" = $1 AND m.resolved = false
     GROUP BY m."topicId", t.name, t."subjectId"
     HAVING SUM(m."timesWrong") >= 2
     ORDER BY "totalWrong" DESC
     LIMIT 5`,
    [userId]
  );
  for (const row of mistakeTopics) {
    candidates.push({
      type: 'MISCONCEPTION',
      title: `Repeated mistakes in ${row.topicName}`,
      message: `You've answered ${row.topicName} questions incorrectly ${row.totalWrong} times. Practicing your mistakes for this topic could help.`,
      subjectId: row.subjectId,
      topicId: row.topicId,
      priority: 4,
    });
  }

  return candidates;
}

export const recommendationService = {
  /** Regenerates the student's recommendation list from current data and persists it. */
  async regenerate(userId: string) {
    const candidates = await buildCandidates(userId);

    // Dedupe by (type, topicId), keeping the highest-priority instance of each.
    const byKey = new Map<string, Candidate>();
    for (const c of candidates) {
      const key = `${c.type}:${c.topicId ?? 'none'}`;
      const existing = byKey.get(key);
      if (!existing || c.priority > existing.priority) byKey.set(key, c);
    }

    const top = [...byKey.values()].sort((a, b) => b.priority - a.priority).slice(0, 10);

    await recommendationRepo.deactivateAll(userId);
    const created = [];
    for (const c of top) {
      created.push(await recommendationRepo.create({ userId, ...c }));
    }
    return created;
  },

  async listActive(userId: string) {
    return recommendationRepo.listActive(userId);
  },

  async dismiss(id: string, userId: string) {
    return recommendationRepo.dismiss(id, userId);
  },
};
