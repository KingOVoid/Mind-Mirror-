import type { Request, Response } from 'express';
import { asyncHandler } from '../utils/AppError';
import { quizService } from '../services/quizService';

export const quizController = {
  create: asyncHandler(async (req: Request, res: Response) => {
    const result = await quizService.generateQuiz({ userId: req.user!.id, ...req.body });
    res.status(201).json(result);
  }),

  createPersonalized: asyncHandler(async (req: Request, res: Response) => {
    const result = await quizService.generatePersonalizedQuiz(
      req.user!.id,
      req.body.subjectId,
      req.body.numQuestions ?? 8
    );
    res.status(201).json(result);
  }),

  getOne: asyncHandler(async (req: Request, res: Response) => {
    const result = await quizService.getQuiz(req.params.id as string, req.user!.id);
    res.json(result);
  }),

  submit: asyncHandler(async (req: Request, res: Response) => {
    const result = await quizService.submitQuiz(req.body.attemptId, req.user!.id, req.body.answers);
    res.json(result);
  }),

  review: asyncHandler(async (req: Request, res: Response) => {
    const result = await quizService.getAttemptReview(req.params.attemptId as string, req.user!.id);
    res.json(result);
  }),

  history: asyncHandler(async (req: Request, res: Response) => {
    const history = await quizService.listHistory(req.user!.id);
    res.json({ history });
  }),
};
