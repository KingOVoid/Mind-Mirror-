import type { Request, Response } from 'express';
import { asyncHandler, AppError } from '../utils/AppError';
import { studySessionRepo } from '../db/repositories/studySessionRepo';
import { recomputeLearningProfile } from '../services/learningProfileService';

export const studySessionController = {
  start: asyncHandler(async (req: Request, res: Response) => {
    const existing = await studySessionRepo.findActive(req.user!.id);
    if (existing) {
      // Only one active session at a time — return it instead of creating a duplicate.
      return res.status(200).json({ session: existing, resumed: true });
    }
    const session = await studySessionRepo.start(req.user!.id, req.body);
    res.status(201).json({ session, resumed: false });
  }),

  getActive: asyncHandler(async (req: Request, res: Response) => {
    const session = await studySessionRepo.findActive(req.user!.id);
    res.json({ session });
  }),

  pause: asyncHandler(async (req: Request, res: Response) => {
    const session = await studySessionRepo.findById(req.params.id as string);
    if (!session || session.userId !== req.user!.id) throw AppError.notFound('Session not found');
    const updated = await studySessionRepo.addPausedMs(req.params.id as string, req.body.pausedMs);
    res.json({ session: updated });
  }),

  finish: asyncHandler(async (req: Request, res: Response) => {
    const session = await studySessionRepo.findById(req.params.id as string);
    if (!session || session.userId !== req.user!.id) throw AppError.notFound('Session not found');
    if (!session.isActive) throw AppError.badRequest('This session has already ended');
    const finished = await studySessionRepo.finish(req.params.id as string, req.body.notes);
    await recomputeLearningProfile(req.user!.id);
    res.json({ session: finished });
  }),

  history: asyncHandler(async (req: Request, res: Response) => {
    const sessions = await studySessionRepo.listForUser(req.user!.id);
    res.json({ sessions });
  }),
};
