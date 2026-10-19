import type { Request, Response } from 'express';
import { asyncHandler } from '../utils/AppError';
import { analyticsService, type RangeKey } from '../services/analyticsService';

const VALID_RANGES: RangeKey[] = ['7d', '30d', '3m', 'all'];

export const analyticsController = {
  get: asyncHandler(async (req: Request, res: Response) => {
    const rangeParam = (req.query.range as string) ?? '30d';
    const range: RangeKey = VALID_RANGES.includes(rangeParam as RangeKey) ? (rangeParam as RangeKey) : '30d';
    const data = await analyticsService.getAnalytics(req.user!.id, range);
    res.json(data);
  }),
};
