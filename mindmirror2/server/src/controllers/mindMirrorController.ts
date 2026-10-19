import type { Request, Response } from 'express';
import { asyncHandler } from '../utils/AppError';
import { mindMirrorService } from '../services/mindMirrorService';

export const mindMirrorController = {
  get: asyncHandler(async (req: Request, res: Response) => {
    const data = await mindMirrorService.getMindMirror(req.user!.id);
    res.json(data);
  }),
};
