import { query } from '../pool';

export const topicProgressRepo = {
  async findByUserAndTopic(userId: string, topicId: string) {
    return null;
  },
  async upsert(data: any) {
    return data;
  },
  async getWeakTopics(userId: string) {
    return [];
  },
  async getForgettingTopics(userId: string) {
    return [];
  },
};
