import type { Request, Response } from 'express';
import { asyncHandler } from '../utils/AppError';
import { mistakeRepo } from '../db/repositories/mistakeRepo';
import { quizRepo } from '../db/repositories/quizRepo';
import { questionRepo } from '../db/repositories/questionRepo';
import { withTransaction } from '../db/pool';

export const mistakeController = {
  list: asyncHandler(async (req: Request, res: Response) => {
    const onlyUnresolved = req.query.unresolved === 'true';
    const mistakes = await mistakeRepo.listForUser(req.user!.id, onlyUnresolved);
    res.json({ mistakes });
  }),

  /** Builds a quiz out of the student's own unresolved mistakes, across topics/subjects. */
  practiceMistakes: asyncHandler(async (req: Request, res: Response) => {
    const mistakes = await mistakeRepo.listForUser(req.user!.id, true);
    if (mistakes.length === 0) {
      return res.status(200).json({ quiz: null, attemptId: null, questions: [], message: 'No unresolved mistakes to practice — nice work.' });
    }

    const limited = mistakes.slice(0, 15);
    const subjectId = limited[0].subjectId;

    const { quiz, quizQuestions } = await withTransaction(async (client) => {
      const quiz = await quizRepo.createQuiz(
        { userId: req.user!.id, subjectId, title: 'Practice My Mistakes', difficulty: 'MEDIUM', isPersonalized: true },
        client
      );
      const quizQuestions = [];
      for (let i = 0; i < limited.length; i++) {
        const qq = await quizRepo.addQuestion(quiz.id, limited[i].questionId, limited[i].topicId, i, client);
        quizQuestions.push(qq);
      }
      return { quiz, quizQuestions };
    });

    const attempt = await quizRepo.createAttempt(req.user!.id, quiz.id, limited.length);

    const questions = [];
    for (let i = 0; i < limited.length; i++) {
      const q = await questionRepo.findById(limited[i].questionId);
      if (!q) continue;
      const { correctAnswer, explanation, ...safe } = q as any;
      questions.push({ ...safe, quizQuestionId: quizQuestions[i].id, questionId: q.id });
    }

    res.status(201).json({ quiz, attemptId: attempt.id, questions });
  }),
};
