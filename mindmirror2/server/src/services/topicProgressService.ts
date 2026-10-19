import { topicProgressRepo, type TopicProgressRow } from '../db/repositories/topicProgressRepo';
import {
  calculateKnowledgeScore,
  classifyMastery,
  calculateRetention,
  calculateConfidenceCalibration,
  calculateRecentTrend,
  difficultyWeight,
  type DifficultyLevel,
} from './analyticsEngine';

export interface AnsweredQuestionForTopic {
  isCorrect: boolean;
  timeSpentMs: number;
  confidenceRating: number | null;
  difficulty: DifficultyLevel;
}

/**
 * Called right after a quiz/test submission for every topic that had at
 * least one question answered. Folds the new answers into the running
 * per-topic stats and recomputes knowledge score, mastery, and retention.
 */
export async function recordTopicActivity(
  userId: string,
  subjectId: string,
  topicId: string,
  newAnswers: AnsweredQuestionForTopic[],
  asOf: Date = new Date()
): Promise<TopicProgressRow> {
  const progress = await topicProgressRepo.getOrCreate(userId, subjectId, topicId);

  const newCorrect = newAnswers.filter((a) => a.isCorrect).length;
  const newIncorrect = newAnswers.length - newCorrect;

  const prevAttempts = progress.attempts;
  const totalAttempts = prevAttempts + newAnswers.length;

  const totalCorrect = progress.correctAnswers + newCorrect;
  const totalIncorrect = progress.incorrectAnswers + newIncorrect;
  const accuracy = totalAttempts > 0 ? (totalCorrect / totalAttempts) * 100 : 0;

  // Response time: weighted running average.
  const newAvgResponseTime =
    newAnswers.length > 0
      ? newAnswers.reduce((s, a) => s + a.timeSpentMs, 0) / newAnswers.length
      : progress.avgResponseTimeMs;
  const avgResponseTimeMs =
    totalAttempts > 0
      ? Math.round((progress.avgResponseTimeMs * prevAttempts + newAvgResponseTime * newAnswers.length) / totalAttempts)
      : 0;

  // Difficulty weight: weighted running average of difficulty weights seen.
  const newAvgDifficultyWeight =
    newAnswers.length > 0
      ? newAnswers.reduce((s, a) => s + difficultyWeight(a.difficulty), 0) / newAnswers.length
      : progress.avgDifficultyWeight;
  const avgDifficultyWeight =
    totalAttempts > 0
      ? (progress.avgDifficultyWeight * prevAttempts + newAvgDifficultyWeight * newAnswers.length) / totalAttempts
      : 0.7;

  // Confidence: blend running average confidence with this batch's ratings.
  const ratedNew = newAnswers.filter((a) => a.confidenceRating != null);
  const prevConfidenceTotal = (progress.avgConfidence ?? 0) * prevAttempts;
  const newConfidenceTotal = ratedNew.reduce((s, a) => s + (a.confidenceRating as number), 0);
  const avgConfidence =
    totalAttempts > 0 ? (prevConfidenceTotal + newConfidenceTotal) / totalAttempts || null : null;

  // Confidence calibration: blend previous calibration (weighted by prior attempts)
  // with this batch's calibration (weighted by new answer count).
  const batchCalibration = calculateConfidenceCalibration(newAnswers);
  const confidenceCalibration =
    prevAttempts > 0 && progress.confidenceCalibration != null
      ? (progress.confidenceCalibration * prevAttempts + batchCalibration * newAnswers.length) / totalAttempts
      : batchCalibration;

  // Recent trend: compare this batch's accuracy against the topic's accuracy before this batch.
  const batchAccuracy = newAnswers.length > 0 ? (newCorrect / newAnswers.length) * 100 : null;
  const priorAccuracy = prevAttempts > 0 ? progress.accuracy : null;
  const recentAccuracyTrend = calculateRecentTrend(batchAccuracy, priorAccuracy);

  const successfulRecalls = progress.successfulRecalls + newCorrect;
  const revisionCount = progress.revisionCount + 1;

  // The student just engaged with this topic, so retention resets based on "studied today".
  const { score: retentionScore, status: retentionStatus } = calculateRetention({
    daysSinceLastStudied: 0,
    successfulRecalls,
    difficulty: (progress.difficultyLevel as DifficultyLevel) ?? 'MEDIUM',
    revisionCount,
  });

  const knowledgeScore = calculateKnowledgeScore({
    accuracy,
    attempts: totalAttempts,
    avgDifficultyWeight,
    retentionScore,
    confidenceAccuracyGap: confidenceCalibration,
    recentAccuracyTrend,
  });

  const masteryStatus = classifyMastery({
    attempts: totalAttempts,
    knowledgeScore,
    retentionScore,
    recentAccuracyTrend,
  });

  return topicProgressRepo.save(progress.id, {
    attempts: totalAttempts,
    correctAnswers: totalCorrect,
    incorrectAnswers: totalIncorrect,
    accuracy: Math.round(accuracy * 10) / 10,
    avgResponseTimeMs,
    avgConfidence: avgConfidence != null ? Math.round(avgConfidence * 100) / 100 : null,
    confidenceCalibration: Math.round(confidenceCalibration * 100) / 100,
    knowledgeScore,
    avgDifficultyWeight: Math.round(avgDifficultyWeight * 1000) / 1000,
    masteryStatus,
    retentionStatus,
    retentionScore,
    revisionCount,
    successfulRecalls,
    lastStudiedAt: asOf,
    lastAssessedAt: asOf,
    updatedAt: asOf,
  } as any);
}

/**
 * Read-time projection: recomputes retention (and therefore knowledge score
 * and mastery) as of *right now*, based on how long it's been since the
 * topic was last studied — without needing a cron job to decay stored
 * values. The stored row is left untouched; this is purely a view.
 */
export function withLiveRetention<T extends TopicProgressRow>(row: T): T {
  if (!row.lastStudiedAt || row.attempts === 0) return row;

  const daysSince = (Date.now() - new Date(row.lastStudiedAt).getTime()) / (1000 * 60 * 60 * 24);
  const { score: liveRetentionScore, status: liveRetentionStatus } = calculateRetention({
    daysSinceLastStudied: Math.max(0, daysSince),
    successfulRecalls: row.successfulRecalls,
    difficulty: (row.difficultyLevel as DifficultyLevel) ?? 'MEDIUM',
    revisionCount: row.revisionCount,
  });

  // Recency trend is a write-time-only signal (this batch vs the prior one) —
  // there is nothing to recompute it from at read time, so it is intentionally
  // left out of the live knowledge score (treated as neutral/0) rather than
  // guessed at. This mirrors how the score was already shown immediately
  // after the activity that set it, with only the retention term decaying
  // further over time.
  const liveKnowledgeScore = calculateKnowledgeScore({
    accuracy: row.accuracy,
    attempts: row.attempts,
    avgDifficultyWeight: row.avgDifficultyWeight,
    retentionScore: liveRetentionScore,
    confidenceAccuracyGap: row.confidenceCalibration ?? 0,
    recentAccuracyTrend: 0,
  });

  // Mastery is NOT fully recomputed at read time: classifyMastery's
  // WEAK-vs-IMPROVING split depends on the recent-trend signal, which only
  // exists at write time. Recomputing it here with trend=0 would silently
  // flip a trend-justified WEAK into IMPROVING on every read with no new
  // activity. Instead, the stored mastery is kept as the source of truth,
  // with only the one legitimate *pure-decay* transition applied live: a
  // previously-learned topic whose retention has since collapsed becomes
  // AT_RISK even without new activity.
  const liveMastery =
    liveRetentionScore < 35 && liveKnowledgeScore >= 40 ? 'AT_RISK' : row.masteryStatus;

  return {
    ...row,
    retentionScore: liveRetentionScore,
    retentionStatus: liveRetentionStatus,
    knowledgeScore: liveKnowledgeScore,
    masteryStatus: liveMastery,
  };
}
