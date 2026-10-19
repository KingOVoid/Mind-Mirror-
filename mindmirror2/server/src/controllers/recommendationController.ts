import type { Request, Response } from 'express';
import { asyncHandler } from '../utils/AppError';
import { recommendationService } from '../services/recommendationService';

export const recommendationController = {
  list: asyncHandler(async (req: Request, res: Response) => {
    const recommendations = await recommendationService.listActive(req.user!.id);
    res.json({ recommendations });
  }),

  regenerate: asyncHandler(async (req: Request, res: Response) => {
    const recommendations = await recommendationService.regenerate(req.user!.id);
    res.json({ recommendations });
  }),

  dismiss: asyncHandler(async (req: Request, res: Response) => {
    const rec = await recommendationService.dismiss(req.params.id as string, req.user!.id);
    res.json({ recommendation: rec });
  }),
};
