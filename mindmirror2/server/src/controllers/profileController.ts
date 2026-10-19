import type { Request, Response } from 'express';
import { asyncHandler, AppError } from '../utils/AppError';
import { studentProfileRepo } from '../db/repositories/studentProfileRepo';
import { userRepo } from '../db/repositories/userRepo';
import { hashPassword, verifyPassword } from '../utils/auth';

export const profileController = {
  update: asyncHandler(async (req: Request, res: Response) => {
    const profile = await studentProfileRepo.update(req.user!.id, req.body);
    res.json({ profile });
  }),

  changePassword: asyncHandler(async (req: Request, res: Response) => {
    const { currentPassword, newPassword } = req.body;
    const user = await userRepo.findById(req.user!.id);
    if (!user) throw AppError.notFound('User not found');
    const valid = await verifyPassword(currentPassword, user.passwordHash);
    if (!valid) throw AppError.unauthorized('Current password is incorrect');
    const passwordHash = await hashPassword(newPassword);
    await userRepo.updatePassword(user.id, passwordHash);
    res.json({ success: true });
  }),
};
