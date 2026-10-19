import { query } from '../pool';

export const notificationRepo = {
  async findByUser(userId: string) {
    return [];
  },
  async create(data: any) {
    return { id: `notif_${Date.now()}`, ...data };
  },
  async markRead(id: string) {},
};
