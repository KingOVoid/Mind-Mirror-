import { dashboardRepo } from '../db/repositories/dashboardRepo';
import { mistakeRepo } from '../db/repositories/mistakeRepo';
import { recommendationService } from './recommendationService';
import { withLiveRetention } from './topicProgressService';
import { quizService } from './quizService';
import { AppError } from '../utils/AppError';
import type { DifficultyLevel } from './analyticsEngine';

export const reviewCenterService = {
  async getReviewCenter(userId: string) {
    const rawTopics = await dashboardRepo.topicProgressWithNames(userId);
    const liveTopics = rawTopics.map((t: any) => withLiveRetention(t)).filter((t: any) => t.attempts > 0);

    const weakTopics = liveTopics.filter((t: any) => t.masteryStatus === 'WEAK');
    const atRiskTopics = liveTopics.filter((t: any) => t.masteryStatus === 'AT_RISK');
    const forgottenTopics = liveTopics.filter((t: any) => t.retentionStatus === 'LIKELY_FORGOTTEN');

    // "Review Now" = the union of at-risk and forgotten, most urgent first.
    const reviewNow = [...forgottenTopics, ...atRiskTopics]
      .sort((a, b) => a.retentionScore - b.retentionScore)
      .slice(0, 10);

    const recentMistakes = await mistakeRepo.listForUser(userId, true);
    const recommendedQuestions = await recommendationService.listActive(userId);

    return {
      reviewNow,
      weakTopics,
      forgottenTopics,
      atRiskTopics,
      recentMistakes: recentMistakes.slice(0, 10),
      recommendedQuestions,
    };
  },

  /** Starts a targeted revision quiz for a specific topic, using its current difficulty level. */
  async startTargetedRevision(userId: string, topicId: string, subjectId: string) {
    const rawTopics = await dashboardRepo.topicProgressWithNames(userId);
    const topicRow = rawTopics.find((t: any) => t.topicId === topicId);
    const difficulty: DifficultyLevel = (topicRow?.difficultyLevel as DifficultyLevel) ?? 'EASY';

    if (!subjectId) throw AppError.badRequest('subjectId is required');

    return quizService.generateQuiz({ userId, subjectId, topicId, difficulty, numQuestions: 8 });
  },
};
