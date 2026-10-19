import { query } from '../pool';

export const adminRepo = {
  async getStats() {
    return { totalUsers: 1, totalQuizzes: 0, totalTests: 0 };
  },
};
