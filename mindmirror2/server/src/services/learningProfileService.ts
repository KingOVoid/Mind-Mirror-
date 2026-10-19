import { pool } from '../db/pool';
import { topicProgressRepo } from '../db/repositories/topicProgressRepo';
import { learningProfileRepo } from '../db/repositories/learningProfileRepo';
import { studySessionRepo } from '../db/repositories/studySessionRepo';
import { withLiveRetention } from './topicProgressService';
import { computeStreak, getActiveDays } from './streakService';
import { calculateLearningConsistency } from './analyticsEngine';

function avg(nums: number[]): number {
  if (nums.length === 0) return 0;
  return Math.round((nums.reduce((s, n) => s + n, 0) / nums.length) * 10) / 10;
}

/**
 * Recomputes the user's LearningProfile (the top-level Cognitive Twin
 * summary) from current raw activity. Cheap enough to call on every
 * dashboard/Mind Mirror load, and also called right after quiz/test
 * submission and study-session completion so numbers never look stale.
 */
export async function recomputeLearningProfile(userId: string) {
  const rawProgress = await topicProgressRepo.listByUser(userId);
  const liveProgress = rawProgress.map(withLiveRetention);
  const touched = liveProgress.filter((p) => p.attempts > 0);

  const overallKnowledgeScore = avg(touched.map((p) => p.knowledgeScore));
  const avgAccuracy = avg(touched.map((p) => p.accuracy));
  const confidenceRated = touched.filter((p) => p.avgConfidence != null);
  const avgConfidence = avg(confidenceRated.map((p) => p.avgConfidence as number));
  const confidenceAccuracyGap = avg(touched.map((p) => p.confidenceCalibration ?? 0));
  const avgResponseTimeMs = Math.round(avg(touched.map((p) => p.avgResponseTimeMs)));

  const strongTopicsCount = touched.filter((p) => p.masteryStatus === 'STRONG' || p.masteryStatus === 'MASTERED').length;
  const weakTopicsCount = touched.filter((p) => p.masteryStatus === 'WEAK').length;
  const atRiskTopicsCount = touched.filter((p) => p.masteryStatus === 'AT_RISK').length;
  const forgottenTopicsCount = touched.filter((p) => p.retentionStatus === 'LIKELY_FORGOTTEN').length;

  const { rows: quizCountRows } = await pool.query(
    `SELECT COUNT(*)::int AS count FROM "QuizAttempt" WHERE "userId" = $1 AND status = 'SUBMITTED'`,
    [userId]
  );
  const { rows: testCountRows } = await pool.query(
    `SELECT COUNT(*)::int AS count FROM "TestAttempt" WHERE "userId" = $1 AND status = 'SUBMITTED'`,
    [userId]
  );

  const totalStudyTimeMin = await studySessionRepo.totalMinutesAllTime(userId);
  const { currentStreak, longestStreak, activeDays } = await computeStreak(userId);
  const activeDaysLast30 = (await getActiveDays(userId)).filter((d) => {
    const days = (Date.now() - new Date(d + 'T00:00:00Z').getTime()) / (1000 * 60 * 60 * 24);
    return days <= 30;
  });
  const learningConsistency = calculateLearningConsistency(activeDaysLast30.length, 30);

  const fields = {
    overallKnowledgeScore,
    avgAccuracy,
    avgConfidence,
    confidenceAccuracyGap,
    avgResponseTimeMs,
    learningConsistency,
    currentStreak,
    longestStreak,
    lastActiveDate: activeDays[0] ? new Date(activeDays[0] + 'T00:00:00Z') : null,
    totalStudyTimeMin,
    totalQuizzes: quizCountRows[0].count,
    totalTests: testCountRows[0].count,
    strongTopicsCount,
    weakTopicsCount,
    atRiskTopicsCount,
    forgottenTopicsCount,
  };

  await learningProfileRepo.upsertComputed(userId, fields);
  return { ...fields, topicProgress: liveProgress };
}
