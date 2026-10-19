import type { Request, Response } from 'express';
import { asyncHandler, AppError } from '../utils/AppError';
import { notificationRepo } from '../db/repositories/notificationRepo';

export const notificationController = {
  list: asyncHandler(async (req: Request, res: Response) => {
    const [notifications, unreadCount] = await Promise.all([
      notificationRepo.listForUser(req.user!.id),
      notificationRepo.unreadCount(req.user!.id),
    ]);
    res.json({ notifications, unreadCount });
  }),

  markRead: asyncHandler(async (req: Request, res: Response) => {
    const notif = await notificationRepo.markRead(req.params.id as string, req.user!.id);
    if (!notif) throw AppError.notFound('Notification not found');
    res.json({ notification: notif });
  }),

  markAllRead: asyncHandler(async (req: Request, res: Response) => {
    await notificationRepo.markAllRead(req.user!.id);
    res.json({ success: true });
  }),
};
