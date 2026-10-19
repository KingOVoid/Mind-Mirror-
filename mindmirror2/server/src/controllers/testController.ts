import type { Request, Response } from 'express';
import { asyncHandler } from '../utils/AppError';
import { testService } from '../services/testService';

export const testController = {
  create: asyncHandler(async (req: Request, res: Response) => {
    const test = await testService.createTest({ createdById: req.user!.id, ...req.body });
    res.status(201).json({ test });
  }),

  list: asyncHandler(async (req: Request, res: Response) => {
    const tests = await testService.listPublished(req.query.subjectId as string | undefined);
    res.json({ tests });
  }),

  start: asyncHandler(async (req: Request, res: Response) => {
    const result = await testService.startTest(req.params.id as string, req.user!.id);
    res.status(201).json(result);
  }),

  saveAnswer: asyncHandler(async (req: Request, res: Response) => {
    const result = await testService.saveAnswer(req.params.attemptId as string, req.user!.id, req.body);
    res.json({ answer: result });
  }),

  submit: asyncHandler(async (req: Request, res: Response) => {
    const result = await testService.submitTest(req.body.attemptId, req.user!.id, req.body.answers);
    res.json(result);
  }),

  review: asyncHandler(async (req: Request, res: Response) => {
    const result = await testService.getAttemptReview(req.params.attemptId as string, req.user!.id);
    res.json(result);
  }),

  history: asyncHandler(async (req: Request, res: Response) => {
    const history = await testService.listHistory(req.user!.id);
    res.json({ history });
  }),
};
