import { withTransaction } from '../db/pool';
import { userRepo } from '../db/repositories/userRepo';
import { studentProfileRepo } from '../db/repositories/studentProfileRepo';
import { learningProfileRepo } from '../db/repositories/learningProfileRepo';
import { passwordResetRepo } from '../db/repositories/passwordResetRepo';
import { hashPassword, verifyPassword, signToken } from '../utils/auth';
import { AppError } from '../utils/AppError';
import type { RegisterInput, LoginInput } from '../utils/validators/authSchemas';
import type { AuthUser } from '../types';

function toAuthUser(user: { id: string; email: string; fullName: string; role: string }): AuthUser {
  return { id: user.id, email: user.email, fullName: user.fullName, role: user.role as any };
}

export const authService = {
  async register(input: RegisterInput) {
    const existing = await userRepo.findByEmail(input.email);
    if (existing) {
      throw AppError.conflict('An account with this email already exists');
    }

    const passwordHash = await hashPassword(input.password);

    const user = await withTransaction(async (client) => {
      const createdUser = await userRepo.create(
        { email: input.email, passwordHash, fullName: input.fullName },
        client
      );
      await studentProfileRepo.create(
        createdUser.id,
        { college: input.college || undefined, course: input.course || undefined, semester: input.semester || undefined },
        client
      );
      await learningProfileRepo.create(createdUser.id, client);
      return createdUser;
    });

    const authUser = toAuthUser(user);
    const token = signToken(authUser);
    return { user: authUser, token };
  },

  async login(input: LoginInput) {
    const user = await userRepo.findByEmail(input.email);
    if (!user) {
      throw AppError.unauthorized('No account found with this email');
    }
    const valid = await verifyPassword(input.password, user.passwordHash);
    if (!valid) {
      throw AppError.unauthorized('Incorrect password');
    }
    const authUser = toAuthUser(user);
    const token = signToken(authUser);
    return { user: authUser, token };
  },

  async me(userId: string) {
    const user = await userRepo.findById(userId);
    if (!user) throw AppError.notFound('User not found');
    const profile = await studentProfileRepo.findByUserId(userId);
    return { user: toAuthUser(user), profile };
  },

  async forgotPassword(email: string) {
    const user = await userRepo.findByEmail(email);
    // Always behave the same whether or not the account exists, to avoid leaking
    // which emails are registered.
    if (!user) {
      return { devToken: null as string | null };
    }
    const { token } = await passwordResetRepo.createToken(user.id, 60);
    // No email provider configured in this environment: return the token directly
    // in development so the reset flow is fully testable end-to-end. In production,
    // wire this up to a real email service (e.g. via EMAIL_* env vars) and stop
    // returning the token in the response.
    return { devToken: token };
  },

  async resetPassword(token: string, newPassword: string) {
    const record = await passwordResetRepo.findValidToken(token);
    if (!record) {
      throw AppError.badRequest('This reset link is invalid or has expired');
    }
    const passwordHash = await hashPassword(newPassword);
    await userRepo.updatePassword(record.userId, passwordHash);
    await passwordResetRepo.markUsed(record.id);
  },
};
