import type { Request, Response } from 'express';
import { AppError, asyncHandler } from '../utils/AppError';
import { authService } from '../services/authService';
import { cookieOptions, AUTH_COOKIE_NAME } from '../utils/auth';
import { env } from '../config/env';

export const authController = {
  register: async (req: Request, res: Response) => {
    try {
      console.log(`[AUTH] Register request received for email: "${req.body?.email}"`);
      const { user, token } = await authService.register(req.body);
      res.cookie(AUTH_COOKIE_NAME, token, cookieOptions());
      return res.status(201).json({ user, token });
    } catch (err: any) {
      console.error('\n==================== [AUTH /register ERROR] ====================');
      console.error('Registration failed with error:', err?.message || err);
      console.error('Error Code:', err?.code);
      console.error('Full Error Object:');
      console.error(err);
      if (err?.stack) {
        console.error('Stack Trace:');
        console.error(err.stack);
      }
      console.error('================================================================\n');

      if (err instanceof AppError) {
        return res.status(err.statusCode).json({ error: err.message, details: err.details });
      }

      // Check for Postgres connection or query errors
      const isPostgresConnError =
        err?.code === 'ECONNREFUSED' ||
        err?.code === 'ENOTFOUND' ||
        err?.code === 'ETIMEDOUT' ||
        err?.code === '28P01' || // invalid password
        err?.code === '3D000' || // database does not exist
        (typeof err?.message === 'string' && (err.message.includes('ECONNREFUSED') || err.message.includes('connect')));

      const diagnostic = isPostgresConnError
        ? `Database connection failed (${err?.code || 'ECONNREFUSED'}). Ensure PostgreSQL is active on port 5432 and DATABASE_URL in .env is correct.`
        : err?.message || 'Internal server error';

      return res.status(500).json({
        error: 'Internal server error',
        message: diagnostic,
        code: err?.code,
        details: err?.message || String(err),
      });
    }
  },

  login: asyncHandler(async (req: Request, res: Response) => {
    const { user, token } = await authService.login(req.body);
    res.cookie(AUTH_COOKIE_NAME, token, cookieOptions());
    res.status(200).json({ user, token });
  }),

  logout: asyncHandler(async (_req: Request, res: Response) => {
    res.clearCookie(AUTH_COOKIE_NAME, { path: '/' });
    res.status(200).json({ success: true });
  }),

  me: asyncHandler(async (req: Request, res: Response) => {
    const data = await authService.me(req.user!.id);
    res.status(200).json(data);
  }),

  forgotPassword: asyncHandler(async (req: Request, res: Response) => {
    const { devToken } = await authService.forgotPassword(req.body.email);
    res.status(200).json({
      message: 'If an account with that email exists, a reset link has been generated.',
      // Development-only fallback since no email provider is configured.
      // Remove this field once a real email service is wired up in production.
      ...(env.IS_PROD ? {} : { devResetToken: devToken }),
    });
  }),

  resetPassword: asyncHandler(async (req: Request, res: Response) => {
    await authService.resetPassword(req.body.token, req.body.password);
    res.status(200).json({ success: true, message: 'Password updated. You can now log in.' });
  }),
};
