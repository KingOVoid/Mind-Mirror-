import { query } from '../pool';

export const passwordResetRepo = {
  async create(userId: string, token: string, expiresAt: Date) {
    return { userId, token, expiresAt };
  },
  async findValidToken(token: string) {
    return null;
  },
  async markUsed(id: string) {},
};
