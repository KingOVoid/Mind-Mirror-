import { pool } from '../db/pool';
import { userRepo } from '../db/repositories/userRepo';
import { dashboardRepo } from '../db/repositories/dashboardRepo';
import { quizRepo } from '../db/repositories/quizRepo';
import { testRepo } from '../db/repositories/testRepo';
import { subjectRepo } from '../db/repositories/subjectRepo';
import { recomputeLearningProfile } from './learningProfileService';
import { withLiveRetention } from './topicProgressService';

function greetingForHour(hour: number): string {
  if (hour < 5) return 'Still up studying';
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  if (hour < 21) return 'Good evening';
  return 'Good night';
}

export const dashboardService = {
  async getDashboard(userId: string) {
    const user = await userRepo.findById(userId);
    const profile = await recomputeLearningProfile(userId);

    const rawTopicRows = await dashboardRepo.topicProgressWithNames(userId);
    const liveTopics = rawTopicRows.map((row: any) => ({ ...withLiveRetention(row), topicName: row.topicName, subjectName: row.subjectName }));
    const touched = liveTopics.filter((t) => t.attempts > 0);

    const strongTopics = touched
      .filter((t) => t.masteryStatus === 'STRONG' || t.masteryStatus === 'MASTERED')
      .sort((a, b) => b.knowledgeScore - a.knowledgeScore)
      .slice(0, 5);

    const weakTopics = touched
      .filter((t) => t.masteryStatus === 'WEAK')
      .sort((a, b) => a.knowledgeScore - b.knowledgeScore)
      .slice(0, 5);

    const topicsAtRisk = touched
      .filter((t) => t.masteryStatus === 'AT_RISK' || t.retentionStatus === 'AT_RISK' || t.retentionStatus === 'LIKELY_FORGOTTEN')
      .sort((a, b) => a.retentionScore - b.retentionScore)
      .slice(0, 5);

    // Knowledge coverage: of all topics visible to this student (across their subjects),
    // how many have they engaged with at least once.
    const subjects = await subjectRepo.listForUser(userId);
    const { rows: topicCountRows } = await pool.query(
      `SELECT COUNT(*)::int AS count FROM "Topic" WHERE "subjectId" = ANY($1::uuid[])`,
      [subjects.map((s: any) => s.id)]
    );
    const totalTopics = topicCountRows[0]?.count ?? 0;
    const knowledgeCoverage = totalTopics > 0 ? Math.round((touched.length / totalTopics) * 100) : 0;

    const recentQuizzes = await quizRepo.listAttemptsForUser(userId, 5);
    const recentTests = await testRepo.listAttemptsForUser(userId, 5);

    // Recommended next topic: prioritize AT_RISK, then WEAK, then an unstarted topic, then nothing.
    // Untouched topics have no TopicProgress row, so they must be sourced from the full
    // topic list (LEFT JOIN), not from `liveTopics` which only contains touched topics.
    const allTopics = await dashboardRepo.allTopicsWithProgressForUser(userId);
    const unstartedTopic = allTopics.find((t: any) => t.attempts === 0) ?? null;
    const recommendedNextTopic = topicsAtRisk[0] ?? weakTopics[0] ?? unstartedTopic ?? null;

    const hour = new Date().getHours();

    return {
      welcomeMessage: greetingForHour(hour),
      learningScore: profile.overallKnowledgeScore,
      knowledgeCoverage,
      strongTopics,
      weakTopics,
      topicsAtRisk,
      recentQuizzes,
      recentTests,
      studyStreak: { current: profile.currentStreak, longest: profile.longestStreak },
      totalLearningTimeMin: profile.totalStudyTimeMin,
      accuracy: profile.avgAccuracy,
      avgResponseTimeMs: profile.avgResponseTimeMs,
      confidenceScore: profile.avgConfidence,
      confidenceAccuracyGap: profile.confidenceAccuracyGap,
      recommendedNextTopic,
      totalQuizzes: profile.totalQuizzes,
      totalTests: profile.totalTests,
    };
  },
};
