import { query } from '../pool';

export const analyticsRepo = {
  async getUserAnalytics(userId: string) {
    return { masteryTrend: [], studyTimeTrend: [] };
  },
};
