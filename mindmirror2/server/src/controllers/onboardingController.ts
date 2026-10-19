import type { Request, Response } from 'express';
import { asyncHandler } from '../utils/AppError';
import { studentProfileRepo } from '../db/repositories/studentProfileRepo';

export const onboardingController = {
  complete: asyncHandler(async (req: Request, res: Response) => {
    const data = req.body;
    const profile = await studentProfileRepo.completeOnboarding(req.user!.id, {
      learningGoals: data.learningGoals,
      preferredStudyTime: data.preferredStudyTime,
      targetExamDate: data.targetExamDate || null,
      preferredLearningStyle: data.preferredLearningStyle,
      dailyStudyTargetMinutes: data.dailyStudyTargetMinutes,
      strongSubjectTags: data.strongSubjectTags,
      weakSubjectTags: data.weakSubjectTags,
      semester: data.semester,
    });
    res.status(200).json({ profile });
  }),

  status: asyncHandler(async (req: Request, res: Response) => {
    const profile = await studentProfileRepo.findByUserId(req.user!.id);
    res.status(200).json({ onboardingComplete: profile?.onboardingComplete ?? false, profile });
  }),
};
