import type { Request, Response } from 'express';
import { asyncHandler, AppError } from '../utils/AppError';
import { subjectRepo } from '../db/repositories/subjectRepo';
import { topicRepo } from '../db/repositories/topicRepo';

export const subjectController = {
  list: asyncHandler(async (req: Request, res: Response) => {
    const subjects = await subjectRepo.listForUser(req.user!.id);
    res.json({ subjects });
  }),

  getOne: asyncHandler(async (req: Request, res: Response) => {
    const subject = await subjectRepo.findById((req.params.id as string));
    if (!subject) throw AppError.notFound('Subject not found');
    // A subject is visible if it's global or owned by this user.
    if (!subject.isGlobal && subject.ownerId !== req.user!.id && req.user!.role !== 'ADMIN') {
      throw AppError.forbidden();
    }
    const topics = await topicRepo.listBySubjectWithProgress(subject.id, req.user!.id);
    res.json({ subject, topics });
  }),

  create: asyncHandler(async (req: Request, res: Response) => {
    // Students create personal subjects; admins can create global ones via a separate admin route.
    const subject = await subjectRepo.create({ ...req.body, ownerId: req.user!.id, isGlobal: false });
    res.status(201).json({ subject });
  }),

  update: asyncHandler(async (req: Request, res: Response) => {
    const subject = await subjectRepo.findById((req.params.id as string));
    if (!subject) throw AppError.notFound('Subject not found');
    const isOwner = subject.ownerId === req.user!.id;
    const isAdmin = req.user!.role === 'ADMIN';
    if (!isOwner && !isAdmin) throw AppError.forbidden('You can only edit subjects you created');
    const updated = await subjectRepo.update((req.params.id as string), req.body);
    res.json({ subject: updated });
  }),

  remove: asyncHandler(async (req: Request, res: Response) => {
    const subject = await subjectRepo.findById((req.params.id as string));
    if (!subject) throw AppError.notFound('Subject not found');
    const isOwner = subject.ownerId === req.user!.id;
    const isAdmin = req.user!.role === 'ADMIN';
    if (!isOwner && !isAdmin) throw AppError.forbidden('You can only delete subjects you created');
    if (subject.isGlobal && !isAdmin) throw AppError.forbidden('Only admins can delete global subjects');
    await subjectRepo.remove((req.params.id as string));
    res.json({ success: true });
  }),
};
