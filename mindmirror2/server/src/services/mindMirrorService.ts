import { dashboardRepo } from '../db/repositories/dashboardRepo';
import { mindMirrorRepo } from '../db/repositories/mindMirrorRepo';
import { recomputeLearningProfile } from './learningProfileService';
import { recommendationService } from './recommendationService';
import { withLiveRetention } from './topicProgressService';
import { classifyConfidencePattern, type ConfidencePattern } from './analyticsEngine';

export const mindMirrorService = {
  async getMindMirror(userId: string) {
    const profile = await recomputeLearningProfile(userId);

    const rawTopics = await dashboardRepo.topicProgressWithNames(userId);
    const liveTopics = rawTopics.map((t: any) => withLiveRetention(t)).filter((t: any) => t.attempts > 0);

    // ── Knowledge ──────────────────────────────────────────────────────
    // Subject-level scores are averaged from the same live-recomputed topic
    // scores used everywhere else, so they can never disagree with the
    // per-topic numbers shown alongside them.
    const subjectShells = await mindMirrorRepo.subjectsWithTopicCounts(userId);
    const subjectKnowledge = subjectShells.map((s: any) => {
      const topicsForSubject = liveTopics.filter((t: any) => t.subjectId === s.subjectId);
      const knowledgeScore =
        topicsForSubject.length > 0
          ? Math.round((topicsForSubject.reduce((sum: number, t: any) => sum + t.knowledgeScore, 0) / topicsForSubject.length) * 10) / 10
          : 0;
      return {
        subjectId: s.subjectId,
        subjectName: s.subjectName,
        knowledgeScore,
        topicsStarted: topicsForSubject.length,
        totalTopics: s.totalTopics,
      };
    });

    const topicMastery = liveTopics.map((t: any) => ({
      topicId: t.topicId,
      topicName: t.topicName,
      subjectName: t.subjectName,
      knowledgeScore: t.knowledgeScore,
      masteryStatus: t.masteryStatus,
      accuracy: t.accuracy,
    }));

    // ── Behavior ───────────────────────────────────────────────────────
    const behavior = await mindMirrorRepo.behaviorStats(userId);

    // ── Confidence ─────────────────────────────────────────────────────
    const ratedAnswers = await mindMirrorRepo.getRatedQuizAnswers(userId);
    const matrix: Record<ConfidencePattern, number> = {
      STRONG_UNDERSTANDING: 0,
      POSSIBLE_MISCONCEPTION: 0,
      KNOWLEDGE_EXISTS_LOW_CONFIDENCE: 0,
      WEAK_CONCEPT: 0,
      NEUTRAL: 0,
    };
    for (const a of ratedAnswers) {
      const pattern = classifyConfidencePattern(a.confidenceRating, a.isCorrect);
      matrix[pattern]++;
    }

    // ── Retention ──────────────────────────────────────────────────────
    const topicsRemembered = liveTopics.filter((t: any) => t.retentionStatus === 'FRESH' || t.retentionStatus === 'STABLE');
    const topicsForgotten = liveTopics.filter((t: any) => t.retentionStatus === 'LIKELY_FORGOTTEN');
    const topicsNeedingRevision = liveTopics.filter(
      (t: any) => t.retentionStatus === 'NEEDS_REVISION' || t.retentionStatus === 'AT_RISK'
    );

    // ── Risk ───────────────────────────────────────────────────────────
    const strongAreas = liveTopics.filter((t: any) => t.masteryStatus === 'STRONG' || t.masteryStatus === 'MASTERED');
    const weakAreas = liveTopics.filter((t: any) => t.masteryStatus === 'WEAK');
    const atRiskAreas = liveTopics.filter((t: any) => t.masteryStatus === 'AT_RISK');

    const recommendations = await recommendationService.listActive(userId);

    return {
      knowledge: {
        overallKnowledgeScore: profile.overallKnowledgeScore,
        subjectKnowledge,
        topicMastery,
      },
      behavior: {
        studyFrequencyLast30d: behavior.sessionsLast30d,
        quizFrequencyLast30d: behavior.quizzesLast30d,
        testFrequencyLast30d: behavior.testsLast30d,
        avgResponseTimeMs: profile.avgResponseTimeMs,
        avgAccuracy: profile.avgAccuracy,
        learningConsistency: profile.learningConsistency,
        totalStudyTimeMin: profile.totalStudyTimeMin,
      },
      confidence: {
        avgConfidence: profile.avgConfidence,
        confidenceAccuracyGap: profile.confidenceAccuracyGap,
        matrix,
      },
      retention: {
        topicsRemembered: topicsRemembered.map((t: any) => t.topicName),
        topicsForgotten: topicsForgotten.map((t: any) => t.topicName),
        topicsNeedingRevision: topicsNeedingRevision.map((t: any) => t.topicName),
      },
      risk: {
        strongAreas,
        weakAreas,
        atRiskAreas,
        forgottenConcepts: topicsForgotten,
        recommendedRevision: recommendations.filter((r: any) => r.type === 'FORGETTING' || r.type === 'CONFIDENCE_GAP'),
      },
      disclaimer:
        'This profile is a learning-analytics estimate based on your quiz and test activity. It is not a medical, psychological, or standardized assessment.',
    };
  },
};
