import { query } from '../pool';

export const recommendationRepo = {
  async findActive(userId: string) {
    return [];
  },
  async create(data: any) {
    return { id: `rec_${Date.now()}`, ...data };
  },
};
