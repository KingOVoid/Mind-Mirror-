import { pool, withTransaction } from '../db/pool';
import { quizRepo } from '../db/repositories/quizRepo';
import { questionRepo } from '../db/repositories/questionRepo';
import { topicRepo } from '../db/repositories/topicRepo';
import { subjectRepo } from '../db/repositories/subjectRepo';
import { mistakeRepo } from '../db/repositories/mistakeRepo';
import { topicProgressRepo } from '../db/repositories/topicProgressRepo';
import { gradeAnswer } from '../utils/grading';
import { recordTopicActivity, type AnsweredQuestionForTopic } from './topicProgressService';
import { recomputeLearningProfile } from './learningProfileService';
import { recommendationService } from './recommendationService';
import { notificationRepo } from '../db/repositories/notificationRepo';
import { AppError } from '../utils/AppError';
import type { DifficultyLevel } from './analyticsEngine';

export interface GenerateQuizInput {
  userId: string;
  subjectId: string;
  topicId: string;
  difficulty: DifficultyLevel;
  numQuestions: number;
}

function sanitizeQuestion(q: any) {
  // Never send the answer key or explanation to the client before submission.
  const { correctAnswer, explanation, ...safe } = q;
  return safe;
}

export const quizService = {
  async generateQuiz(input: GenerateQuizInput) {
    const subject = await subjectRepo.findById(input.subjectId);
    if (!subject) throw AppError.notFound('Subject not found');
    const topic = await topicRepo.findById(input.topicId);
    if (!topic || topic.subjectId !== input.subjectId) throw AppError.notFound('Topic not found');

    const questions = await questionRepo.pickRandomForTopic(input.topicId, input.difficulty, input.numQuestions);
    if (questions.length === 0) {
      throw AppError.badRequest('No questions are available for this topic and difficulty yet');
    }

    const { quiz, quizQuestions } = await withTransaction(async (client) => {
      const quiz = await quizRepo.createQuiz(
        {
          userId: input.userId,
          subjectId: input.subjectId,
          title: `${topic.name} — ${input.difficulty} Quiz`,
          difficulty: input.difficulty,
        },
        client
      );
      const quizQuestions = [];
      for (let i = 0; i < questions.length; i++) {
        const qq = await quizRepo.addQuestion(quiz.id, questions[i].id, input.topicId, i, client);
        quizQuestions.push(qq);
      }
      return { quiz, quizQuestions };
    });

    const attempt = await quizRepo.createAttempt(input.userId, quiz.id, questions.length);

    const payloadQuestions = questions.map((q, i) => ({
      quizQuestionId: quizQuestions[i].id,
      questionId: q.id,
      type: q.type,
      text: q.text,
      options: q.options,
      difficulty: q.difficulty,
      concept: q.concept,
      topicId: q.topicId,
    }));

    return { quiz, attemptId: attempt.id, questions: payloadQuestions };
  },

  /**
   * "Generate Quiz for Me": picks a topic from the student's weakest / most
   * at-risk topics in the subject (falling back to an unstarted topic, then
   * any topic) and generates an adaptively-difficulty-chosen quiz for it.
   */
  async generatePersonalizedQuiz(userId: string, subjectId: string, numQuestions = 8) {
    const progressRows = await topicProgressRepo.listByUserAndSubject(userId, subjectId);
    const topics = await topicRepo.listBySubject(subjectId);
    if (topics.length === 0) throw AppError.badRequest('This subject has no topics yet');

    const byTopicId = new Map(progressRows.map((p) => [p.topicId, p]));

    // Priority: AT_RISK/WEAK topics with attempts > 0, then NOT_STARTED topics, then anything else.
    const scored = topics.map((t) => {
      const p = byTopicId.get(t.id);
      let priority = 3;
      if (!p || p.attempts === 0) priority = 1;
      else if (p.masteryStatus === 'AT_RISK' || p.masteryStatus === 'WEAK') priority = 0;
      else if (p.masteryStatus === 'LEARNING' || p.masteryStatus === 'IMPROVING') priority = 2;
      return { topic: t, progress: p, priority };
    });
    scored.sort((a, b) => a.priority - b.priority);
    const chosen = scored[0];

    // Adaptive difficulty: harder if they're doing consistently well, easier if struggling.
    let difficulty: DifficultyLevel = 'MEDIUM';
    if (chosen.progress) {
      if (chosen.progress.accuracy >= 85 && chosen.progress.attempts >= 3) difficulty = 'HARD';
      else if (chosen.progress.accuracy < 50 && chosen.progress.attempts >= 2) difficulty = 'EASY';
    }

    return this.generateQuiz({ userId, subjectId, topicId: chosen.topic.id, difficulty, numQuestions });
  },

  async getQuiz(quizId: string, userId: string) {
    const data = await quizRepo.getQuizWithQuestions(quizId);
    if (!data) throw AppError.notFound('Quiz not found');
    const { rows: attempts } = await pool.query(
      `SELECT * FROM "QuizAttempt" WHERE "quizId" = $1 AND "userId" = $2 ORDER BY "startedAt" DESC LIMIT 1`,
      [quizId, userId]
    );
    const attempt = attempts[0] ?? null;
    const sanitized = attempt?.status === 'SUBMITTED' ? data.questions : data.questions.map(sanitizeQuestion);
    return { quiz: data.quiz, questions: sanitized, attempt };
  },

  async submitQuiz(
    attemptId: string,
    userId: string,
    answers: Array<{
      quizQuestionId: string;
      questionId: string;
      selectedAnswer: any;
      timeSpentMs: number;
      confidenceRating?: number | null;
    }>
  ) {
    const attempt = await quizRepo.getAttempt(attemptId);
    if (!attempt) throw AppError.notFound('Quiz attempt not found');
    if (attempt.userId !== userId) throw AppError.forbidden();
    if (attempt.status === 'SUBMITTED') throw AppError.badRequest('This quiz has already been submitted');

    const quizData = await quizRepo.getQuizWithQuestions(attempt.quizId);
    if (!quizData) throw AppError.notFound('Quiz not found');

    const questionById = new Map(quizData.questions.map((q: any) => [q.questionId, q]));

    let correctCount = 0;
    let totalTime = 0;
    let confidenceSum = 0;
    let confidenceCount = 0;

    // Group per-topic so we can update TopicProgress once per topic touched.
    const perTopic = new Map<string, { subjectId: string; items: AnsweredQuestionForTopic[] }>();

    for (const ans of answers) {
      const meta = questionById.get(ans.questionId);
      if (!meta) continue;
      const fullQuestion = await questionRepo.findById(ans.questionId);
      if (!fullQuestion) continue;

      const isCorrect = gradeAnswer(fullQuestion.type, fullQuestion.correctAnswer, ans.selectedAnswer);
      if (isCorrect) correctCount++;
      totalTime += ans.timeSpentMs ?? 0;
      if (ans.confidenceRating != null) {
        confidenceSum += ans.confidenceRating;
        confidenceCount++;
      }

      await quizRepo.recordAnswer({
        attemptId,
        quizQuestionId: ans.quizQuestionId,
        questionId: ans.questionId,
        selectedAnswer: ans.selectedAnswer,
        isCorrect,
        timeSpentMs: ans.timeSpentMs ?? 0,
        confidenceRating: ans.confidenceRating ?? null,
      });

      if (isCorrect) {
        await mistakeRepo.recordCorrected(userId, ans.questionId);
      } else {
        await mistakeRepo.recordWrong(userId, ans.questionId, meta.topicId, ans.selectedAnswer, ans.confidenceRating ?? null);
      }

      const bucket: { subjectId: string; items: AnsweredQuestionForTopic[] } =
        perTopic.get(meta.topicId) ?? { subjectId: quizData.quiz.subjectId, items: [] };
      bucket.items.push({
        isCorrect,
        timeSpentMs: ans.timeSpentMs ?? 0,
        confidenceRating: ans.confidenceRating ?? null,
        difficulty: fullQuestion.difficulty as DifficultyLevel,
      });
      perTopic.set(meta.topicId, bucket);
    }

    const totalQuestions = answers.length;
    const scorePercent = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 1000) / 10 : 0;
    const avgResponseTimeMs = totalQuestions > 0 ? Math.round(totalTime / totalQuestions) : 0;
    const avgConfidence = confidenceCount > 0 ? Math.round((confidenceSum / confidenceCount) * 100) / 100 : null;

    const finalized = await quizRepo.finalizeAttempt(attemptId, {
      correctCount,
      incorrectCount: totalQuestions - correctCount,
      scorePercent,
      avgResponseTimeMs,
      avgConfidence,
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
          message: `Based on your recent quiz, ${topic?.name ?? 'this topic'} is now showing as ${progress.masteryStatus === 'AT_RISK' ? 'at risk' : 'weak'}.`,
        });
      }
    }

    await recomputeLearningProfile(userId);
    await recommendationService.regenerate(userId);

    return { attempt: finalized, updatedTopics };
  },

  async getAttemptReview(attemptId: string, userId: string) {
    const attempt = await quizRepo.getAttempt(attemptId);
    if (!attempt) throw AppError.notFound('Attempt not found');
    if (attempt.userId !== userId) throw AppError.forbidden();
    const answers = await quizRepo.getAttemptAnswers(attemptId);
    const detailed = [];
    for (const a of answers) {
      const q = await questionRepo.findById(a.questionId);
      detailed.push({ ...a, question: q });
    }
    return { attempt, answers: detailed };
  },

  async listHistory(userId: string, limit = 20) {
    return quizRepo.listAttemptsForUser(userId, limit);
  },
};
