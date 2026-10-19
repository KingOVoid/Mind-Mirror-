import { query } from '../pool';

export const quizRepo = {
  async findById(id: string) {
    return null;
  },
  async createAttempt(data: any) {
    return { id: `qa_${Date.now()}`, ...data };
  },
  async submitAttempt(id: string, data: any) {
    return { id, ...data };
  },
};
