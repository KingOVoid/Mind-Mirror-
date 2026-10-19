import { query } from '../pool';

export const testRepo = {
  async findById(id: string) {
    return null;
  },
  async all() {
    return [];
  },
  async createAttempt(data: any) {
    return { id: `ta_${Date.now()}`, ...data };
  },
  async submitAttempt(id: string, data: any) {
    return { id, ...data };
  },
};
