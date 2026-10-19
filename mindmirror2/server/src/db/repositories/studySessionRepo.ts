import { query } from '../pool';

export const studySessionRepo = {
  async start(data: any) {
    return { id: `sess_${Date.now()}`, ...data };
  },
  async end(id: string, durationSec: number) {
    return { id, durationSec };
  },
};
