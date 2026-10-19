import type { Request, Response } from 'express';
import { asyncHandler } from '../utils/AppError';
import { reviewCenterService } from '../services/reviewCenterService';

export const reviewCenterController = {
  get: asyncHandler(async (req: Request, res: Response) => {
    const data = await reviewCenterService.getReviewCenter(req.user!.id);
    res.json(data);
  }),

  startRevision: asyncHandler(async (req: Request, res: Response) => {
    const result = await reviewCenterService.startTargetedRevision(req.user!.id, req.body.topicId, req.body.subjectId);
    res.status(201).json(result);
  }),
};
