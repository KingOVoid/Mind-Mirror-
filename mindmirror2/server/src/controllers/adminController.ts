import type { Request, Response } from 'express';
import { asyncHandler, AppError } from '../utils/AppError';
import { adminRepo } from '../db/repositories/adminRepo';
import { subjectRepo } from '../db/repositories/subjectRepo';
import { topicRepo } from '../db/repositories/topicRepo';

export const adminController = {
  listStudents: asyncHandler(async (_req: Request, res: Response) => {
    const students = await adminRepo.listStudents();
    res.json({ students });
  }),

  getStudent: asyncHandler(async (req: Request, res: Response) => {
    const detail = await adminRepo.getStudentDetail(req.params.id as string);
    if (!detail) throw AppError.notFound('Student not found');
    res.json(detail);
  }),

  stats: asyncHandler(async (_req: Request, res: Response) => {
    const stats = await adminRepo.overallStats();
    res.json({ stats });
  }),

  difficultQuestions: asyncHandler(async (_req: Request, res: Response) => {
    const questions = await adminRepo.difficultQuestions();
    res.json({ questions });
  }),

  weakTopics: asyncHandler(async (_req: Request, res: Response) => {
    const topics = await adminRepo.weakTopicsAcrossStudents();
    res.json({ topics });
  }),

  // Global (admin-authored) subjects/topics — visible to every student.
  createGlobalSubject: asyncHandler(async (req: Request, res: Response) => {
    const subject = await subjectRepo.create({ ...req.body, ownerId: null, isGlobal: true });
    res.status(201).json({ subject });
  }),

  createGlobalTopic: asyncHandler(async (req: Request, res: Response) => {
    const topic = await topicRepo.create(req.body);
    res.status(201).json({ topic });
  }),
};
