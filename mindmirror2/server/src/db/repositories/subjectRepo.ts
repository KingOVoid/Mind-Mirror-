import { query } from '../pool';

export const subjectRepo = {
  async findById(id: string) {
    try {
      const res = await query('SELECT * FROM "Subject" WHERE id = $1', [id]);
      return res.rows[0] || null;
    } catch {
      return null;
    }
  },
  async all() {
    try {
      const res = await query('SELECT * FROM "Subject" ORDER BY name ASC');
      return res.rows;
    } catch {
      return [];
    }
  },
  async listForUser(userId: string) {
    try {
      const res = await query(
        'SELECT * FROM "Subject" WHERE "isGlobal" = true OR "ownerId" = $1 ORDER BY name ASC',
        [userId]
      );
      return res.rows;
    } catch {
      return [];
    }
  },
  async remove(id: string) {
    try {
      await query('DELETE FROM "Subject" WHERE id = $1', [id]);
    } catch {}
  },
  async create(data: any) {
    try {
      const id = data.id || `sub_${Date.now()}`;
      const res = await query(
        'INSERT INTO "Subject" (id, name, description, icon, "isGlobal", "ownerId", "createdAt", "updatedAt") VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW()) RETURNING *',
        [id, data.name, data.description, data.icon || 'BookOpen', data.isGlobal ?? false, data.ownerId || null]
      );
      return res.rows[0];
    } catch {
      return { id: `sub_${Date.now()}`, ...data };
    }
  },
  async update(id: string, data: any) {
    return { id, ...data };
  },
  async delete(id: string) {},
};
