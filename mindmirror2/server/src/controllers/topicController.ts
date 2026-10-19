import type { Request, Response } from 'express';
import { asyncHandler, AppError } from '../utils/AppError';
import { topicRepo } from '../db/repositories/topicRepo';
import { subjectRepo } from '../db/repositories/subjectRepo';

async function assertCanManageSubjectContent(req: Request, subjectId: string) {
  const subject = await subjectRepo.findById(subjectId);
  if (!subject) throw AppError.notFound('Subject not found');
  const isAdmin = req.user!.role === 'ADMIN';
  const isOwner = subject.ownerId === req.user!.id;
  if (subject.isGlobal && !isAdmin) {
    throw AppError.forbidden('Only admins can modify topics on a global subject');
  }
  if (!subject.isGlobal && !isOwner && !isAdmin) {
    throw AppError.forbidden('You can only modify topics on subjects you created');
  }
  return subject;
}

export const topicController = {
  listForSubject: asyncHandler(async (req: Request, res: Response) => {
    const topics = await topicRepo.listBySubjectWithProgress((req.params.subjectId as string), req.user!.id);
    res.json({ topics });
  }),

  create: asyncHandler(async (req: Request, res: Response) => {
    await assertCanManageSubjectContent(req, req.body.subjectId);
    const topic = await topicRepo.create(req.body);
    res.status(201).json({ topic });
  }),

  update: asyncHandler(async (req: Request, res: Response) => {
    const topic = await topicRepo.findById((req.params.id as string));
    if (!topic) throw AppError.notFound('Topic not found');
    await assertCanManageSubjectContent(req, topic.subjectId);
    const updated = await topicRepo.update((req.params.id as string), req.body);
    res.json({ topic: updated });
  }),

  remove: asyncHandler(async (req: Request, res: Response) => {
    const topic = await topicRepo.findById((req.params.id as string));
    if (!topic) throw AppError.notFound('Topic not found');
    await assertCanManageSubjectContent(req, topic.subjectId);
    await topicRepo.remove((req.params.id as string));
    res.json({ success: true });
  }),
};
