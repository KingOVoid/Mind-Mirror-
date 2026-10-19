import { query } from '../pool';

export const mistakeRepo = {
  async findByUser(userId: string) {
    return [];
  },
  async upsert(data: any) {
    return data;
  },
  async markResolved(id: string) {},
};
