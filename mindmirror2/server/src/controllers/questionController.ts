import type { Request, Response } from 'express';
import { asyncHandler, AppError } from '../utils/AppError';
import { questionRepo } from '../db/repositories/questionRepo';

export const questionController = {
  listBySubject: asyncHandler(async (req: Request, res: Response) => {
    const subjectId = req.query.subjectId as string | undefined;
    const topicId = req.query.topicId as string | undefined;
    if (topicId) {
      return res.json({ questions: await questionRepo.listByTopic(topicId, false) });
    }
    if (subjectId) {
      return res.json({ questions: await questionRepo.listBySubject(subjectId) });
    }
    throw AppError.badRequest('subjectId or topicId query parameter is required');
  }),

  create: asyncHandler(async (req: Request, res: Response) => {
    const question = await questionRepo.create({ ...req.body, authorId: req.user!.id });
    res.status(201).json({ question });
  }),

  update: asyncHandler(async (req: Request, res: Response) => {
    const existing = await questionRepo.findById(req.params.id as string);
    if (!existing) throw AppError.notFound('Question not found');
    const question = await questionRepo.update(req.params.id as string, req.body);
    res.json({ question });
  }),

  remove: asyncHandler(async (req: Request, res: Response) => {
    const existing = await questionRepo.findById(req.params.id as string);
    if (!existing) throw AppError.notFound('Question not found');
    // Soft delete by deactivating would preserve attempt history integrity better than a hard delete,
    // but attempts reference questions with ON DELETE CASCADE, which would also wipe student history.
    // So we deactivate instead of hard-deleting to protect already-recorded student data.
    await questionRepo.update(req.params.id as string, { isActive: false });
    res.json({ success: true });
  }),
};
