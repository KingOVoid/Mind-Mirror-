import type { Request, Response } from 'express';
import { asyncHandler } from '../utils/AppError';
import { dashboardService } from '../services/dashboardService';

export const dashboardController = {
  get: asyncHandler(async (req: Request, res: Response) => {
    const data = await dashboardService.getDashboard(req.user!.id);
    res.json(data);
  }),
};
