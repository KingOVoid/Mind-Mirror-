import { withTransaction } from '../db/pool';
import { testRepo } from '../db/repositories/testRepo';
import { questionRepo } from '../db/repositories/questionRepo';
import { subjectRepo } from '../db/repositories/subjectRepo';
import { mistakeRepo } from '../db/repositories/mistakeRepo';
import { gradeAnswer } from '../utils/grading';
import { recordTopicActivity, type AnsweredQuestionForTopic } from './topicProgressService';
import { recomputeLearningProfile } from './learningProfileService';
import { recommendationService } from './recommendationService';
import { notificationRepo } from '../db/repositories/notificationRepo';
import { topicProgressRepo } from '../db/repositories/topicProgressRepo';
import { topicRepo } from '../db/repositories/topicRepo';
import { AppError } from '../utils/AppError';
import type { DifficultyLevel } from './analyticsEngine';

function sanitizeQuestion(q: any) {
  const { correctAnswer, explanation, ...safe } = q;
  return safe;
}

export const testService = {
  async createTest(data: {
    createdById: string;
    title: string;
    subjectId: string;
    topicIds: string[];
    instructions?: string;
    difficulty: DifficultyLevel;
    timeLimitMin: number;
    numQuestions: number;
  }) {
    const subject = await subjectRepo.findById(data.subjectId);
    if (!subject) throw AppError.notFound('Subject not found');

    const perTopic = Math.max(1, Math.ceil(data.numQuestions / data.topicIds.length));
    const selected: Array<{ q: any; topicId: string }> = [];
    for (const topicId of data.topicIds) {
      const qs = await questionRepo.pickRandomForTopic(topicId, data.difficulty, perTopic);
      qs.forEach((q) => selected.push({ q, topicId }));
    }
    const finalSelection = selected.slice(0, data.numQuestions);
    if (finalSelection.length === 0) {
      throw AppError.badRequest('No questions are available for the selected topics and difficulty');
    }

    const test = await withTransaction(async (client) => {
      const test = await testRepo.create(
        {
          createdById: data.createdById,
          title: data.title,
          subjectId: data.subjectId,
          instructions: data.instructions,
          difficulty: data.difficulty,
          timeLimitMin: data.timeLimitMin,
        },
        client
      );
      for (let i = 0; i < finalSelection.length; i++) {
        await testRepo.addQuestion(test.id, finalSelection[i].q.id, finalSelection[i].topicId, i, client);
      }
      return test;
    });

    return test;
  },

  async listPublished(subjectId?: string) {
    return testRepo.listPublished(subjectId);
  },

  async startTest(testId: string, userId: string) {
    const data = await testRepo.getWithQuestions(testId);
    if (!data || !data.test.isPublished) throw AppError.notFound('Test not found');

    const existing = await testRepo.getActiveAttemptForUser(testId, userId);
    const attempt = existing ?? (await testRepo.createAttempt(userId, testId, data.questions.length));

    return {
      test: data.test,
      attempt,
      questions: data.questions.map(sanitizeQuestion),
    };
  },

  async saveAnswer(
    attemptId: string,
    userId: string,
    data: { testQuestionId: string; questionId: string; selectedAnswer: any; markedForReview?: boolean; timeSpentMs?: number }
  ) {
    const attempt = await testRepo.getAttempt(attemptId);
    if (!attempt) throw AppError.notFound('Test attempt not found');
    if (attempt.userId !== userId) throw AppError.forbidden();
    if (attempt.status !== 'IN_PROGRESS') throw AppError.badRequest('This test is no longer in progress');

    const question = await questionRepo.findById(data.questionId);
    if (!question) throw AppError.notFound('Question not found');
    const isCorrect = data.selectedAnswer == null ? false : gradeAnswer(question.type, question.correctAnswer, data.selectedAnswer);

    return testRepo.upsertAnswer({
      attemptId,
      testQuestionId: data.testQuestionId,
      questionId: data.questionId,
      selectedAnswer: data.selectedAnswer,
      isCorrect,
      markedForReview: data.markedForReview ?? false,
      timeSpentMs: data.timeSpentMs ?? 0,
    });
  },

  async submitTest(
    attemptId: string,
    userId: string,
    lateAnswers: Array<{ testQuestionId: string; questionId: string; selectedAnswer?: any; markedForReview?: boolean; timeSpentMs?: number }> = []
  ) {
    const attempt = await testRepo.getAttempt(attemptId);
    if (!attempt) throw AppError.notFound('Test attempt not found');
    if (attempt.userId !== userId) throw AppError.forbidden();
    if (attempt.status === 'SUBMITTED') throw AppError.badRequest('This test has already been submitted');

    // Persist any last-moment answers sent along with the final submit call.
    for (const a of lateAnswers) {
      if (a.selectedAnswer === undefined) continue;
      await this.saveAnswer(attemptId, userId, a as any);
    }

    const testData = await testRepo.getWithQuestions(attempt.testId);
    if (!testData) throw AppError.notFound('Test not found');

    const savedAnswers = await testRepo.getAnswersForAttempt(attemptId);
    const answerByTestQuestionId = new Map(savedAnswers.map((a: any) => [a.testQuestionId, a]));

    let correctCount = 0;
    let incorrectCount = 0;
    let unansweredCount = 0;

    const topicBreakdown: Record<string, { correct: number; total: number; accuracy: number; topicName?: string }> = {};
    const difficultyBreakdown: Record<string, { correct: number; total: number; accuracy: number }> = {
      EASY: { correct: 0, total: 0, accuracy: 0 },
      MEDIUM: { correct: 0, total: 0, accuracy: 0 },
      HARD: { correct: 0, total: 0, accuracy: 0 },
    };

    const perTopic = new Map<string, { subjectId: string; items: AnsweredQuestionForTopic[] }>();

    for (const tq of testData.questions as any[]) {
      const saved = answerByTestQuestionId.get(tq.testQuestionId);
      const fullQuestion = await questionRepo.findById(tq.questionId);
      if (!fullQuestion) continue;

      const wasAnswered = !!saved && saved.selectedAnswer !== null;
      if (!wasAnswered) {
        unansweredCount++;
      } else if (saved.isCorrect) {
        correctCount++;
      } else {
        incorrectCount++;
      }

      if (!topicBreakdown[tq.topicId]) {
        topicBreakdown[tq.topicId] = { correct: 0, total: 0, accuracy: 0, topicName: tq.topicName };
      }
      topicBreakdown[tq.topicId].total++;
      if (wasAnswered && saved.isCorrect) topicBreakdown[tq.topicId].correct++;

      const diff = fullQuestion.difficulty;
      difficultyBreakdown[diff].total++;
      if (wasAnswered && saved.isCorrect) difficultyBreakdown[diff].correct++;

      if (wasAnswered) {
        if (saved.isCorrect) {
          await mistakeRepo.recordCorrected(userId, tq.questionId);
        } else {
          await mistakeRepo.recordWrong(userId, tq.questionId, tq.topicId, saved.selectedAnswer, null);
        }
        const bucket: { subjectId: string; items: AnsweredQuestionForTopic[] } =
          perTopic.get(tq.topicId) ?? { subjectId: testData.test.subjectId, items: [] };
        bucket.items.push({
          isCorrect: saved.isCorrect,
          timeSpentMs: saved.timeSpentMs ?? 0,
          confidenceRating: null,
          difficulty: diff as DifficultyLevel,
        });
        perTopic.set(tq.topicId, bucket);
      }
    }

    for (const key of Object.keys(topicBreakdown)) {
      const t = topicBreakdown[key];
      t.accuracy = t.total > 0 ? Math.round((t.correct / t.total) * 1000) / 10 : 0;
    }
    for (const key of Object.keys(difficultyBreakdown)) {
      const d = difficultyBreakdown[key];
      d.accuracy = d.total > 0 ? Math.round((d.correct / d.total) * 1000) / 10 : 0;
    }

    const totalQuestions = testData.questions.length;
    const scorePercent = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 1000) / 10 : 0;
    const timeUsedSec = Math.max(0, Math.round((Date.now() - new Date(attempt.startedAt).getTime()) / 1000));
    const cappedTimeUsedSec = Math.min(timeUsedSec, testData.test.timeLimitMin * 60 + 30); // small grace window

    const finalized = await testRepo.finalizeAttempt(attemptId, {
      correctCount,
      incorrectCount,
      unansweredCount,
      scorePercent,
      timeUsedSec: cappedTimeUsedSec,
      topicBreakdown,
      difficultyBreakdown,
    });

    const updatedTopics = [];
    for (const [topicId, bucket] of perTopic.entries()) {
      const priorProgress = await topicProgressRepo.findByUserAndTopic(userId, topicId);
      const priorStatus = priorProgress?.masteryStatus;
      const progress = await recordTopicActivity(userId, bucket.subjectId, topicId, bucket.items);
      updatedTopics.push(progress);

      const newlyWeak =
        (progress.masteryStatus === 'WEAK' || progress.masteryStatus === 'AT_RISK') &&
        priorStatus !== 'WEAK' &&
        priorStatus !== 'AT_RISK';
      if (newlyWeak) {
        const topic = await topicRepo.findById(topicId);
        await notificationRepo.create({
          userId,
          type: 'WEAK_TOPIC',
          title: `${topic?.name ?? 'A topic'} needs attention`,
          message: `Based on your recent test, ${topic?.name ?? 'this topic'} is now showing as ${progress.masteryStatus === 'AT_RISK' ? 'at risk' : 'weak'}.`,
        });
      }
    }

    await notificationRepo.create({
      userId,
      type: 'TEST_RESULT',
      title: `Your result for ${testData.test.title} is ready`,
      message: `You scored ${scorePercent}% (${correctCount}/${totalQuestions} correct).`,
    });

    await recomputeLearningProfile(userId);
    await recommendationService.regenerate(userId);

    return { attempt: finalized, topicBreakdown, difficultyBreakdown, updatedTopics };
  },

  async getAttemptReview(attemptId: string, userId: string) {
    const attempt = await testRepo.getAttempt(attemptId);
    if (!attempt) throw AppError.notFound('Attempt not found');
    if (attempt.userId !== userId) throw AppError.forbidden();
    const answers = await testRepo.getAnswersForAttempt(attemptId);
    const detailed = [];
    for (const a of answers) {
      const q = await questionRepo.findById(a.questionId);
      detailed.push({ ...a, question: q });
    }
    return { attempt, answers: detailed };
  },

  async listHistory(userId: string, limit = 20) {
    return testRepo.listAttemptsForUser(userId, limit);
  },
};
