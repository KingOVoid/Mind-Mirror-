import { analyticsRepo } from '../db/repositories/analyticsRepo';
import { dashboardRepo } from '../db/repositories/dashboardRepo';
import { withLiveRetention } from './topicProgressService';

export type RangeKey = '7d' | '30d' | '3m' | 'all';

function resolveSince(range: RangeKey): Date {
  const now = Date.now();
  const day = 24 * 60 * 60 * 1000;
  switch (range) {
    case '7d':
      return new Date(now - 7 * day);
    case '30d':
      return new Date(now - 30 * day);
    case '3m':
      return new Date(now - 90 * day);
    case 'all':
    default:
      return new Date(0);
  }
}

export const analyticsService = {
  async getAnalytics(userId: string, range: RangeKey) {
    const since = resolveSince(range);

    const [quizAccuracy, testScores, studyTime, knowledgeOverTime, masteryDistribution, confidenceVsAccuracy, weakTopicTrend] =
      await Promise.all([
        analyticsRepo.quizAccuracyOverTime(userId, since),
        analyticsRepo.testScoresOverTime(userId, since),
        analyticsRepo.studyTimeOverTime(userId, since),
        analyticsRepo.knowledgeOverTime(userId, since),
        analyticsRepo.topicMasteryDistribution(userId),
        analyticsRepo.confidenceVsAccuracy(userId, since),
        analyticsRepo.weakTopicTrend(userId),
      ]);

    // Retention distribution needs the live recompute, so it's built from
    // the same per-topic data used elsewhere rather than a raw SQL group-by
    // on the (potentially stale) stored retentionStatus column.
    const rawTopics = await dashboardRepo.topicProgressWithNames(userId);
    const liveTopics = rawTopics.map((t: any) => withLiveRetention(t)).filter((t: any) => t.attempts > 0);
    const retentionDistribution: Record<string, number> = {
      FRESH: 0,
      STABLE: 0,
      NEEDS_REVISION: 0,
      AT_RISK: 0,
      LIKELY_FORGOTTEN: 0,
    };
    for (const t of liveTopics) retentionDistribution[t.retentionStatus]++;

    return {
      range,
      quizAccuracyOverTime: quizAccuracy,
      testScoresOverTime: testScores,
      studyTimeOverTime: studyTime,
      knowledgeOverTime,
      topicMasteryDistribution: masteryDistribution,
      retentionDistribution,
      confidenceVsAccuracy,
      weakTopicTrend,
    };
  },
};
