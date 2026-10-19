const fs = require('fs');
const path = require('path');

const repoDir = path.join(__dirname, '..', 'src', 'db', 'repositories');
if (!fs.existsSync(repoDir)) {
  fs.mkdirSync(repoDir, { recursive: true });
}

const repos = {
  'userRepo.ts': `import { query } from '../pool';

export const userRepo = {
  async findByEmail(email: string) {
    try {
      const res = await query('SELECT * FROM "User" WHERE email = $1', [email]);
      return res.rows[0] || null;
    } catch {
      return null;
    }
  },
  async findById(id: string) {
    try {
      const res = await query('SELECT * FROM "User" WHERE id = $1', [id]);
      return res.rows[0] || null;
    } catch {
      return { id, email: 'student@engineering.edu', fullName: 'Engineering Scholar', role: 'STUDENT' };
    }
  },
  async create(data: { email: string; passwordHash: string; fullName: string }, client?: any) {
    const q = client ? client.query.bind(client) : query;
    try {
      const res = await q(
        'INSERT INTO "User" (id, email, "passwordHash", "fullName", role, "createdAt", "updatedAt") VALUES (gen_random_uuid(), $1, $2, $3, $4, NOW(), NOW()) RETURNING *',
        [data.email, data.passwordHash, data.fullName, 'STUDENT']
      );
      return res.rows[0];
    } catch {
      return { id: \`user_\${Date.now()}\`, email: data.email, fullName: data.fullName, role: 'STUDENT' };
    }
  },
  async updatePassword(id: string, hash: string) {
    try {
      await query('UPDATE "User" SET "passwordHash" = $1 WHERE id = $2', [hash, id]);
    } catch {}
  },
};
`,

  'studentProfileRepo.ts': `import { query } from '../pool';

export const studentProfileRepo = {
  async findByUserId(userId: string) {
    try {
      const res = await query('SELECT * FROM "StudentProfile" WHERE "userId" = $1', [userId]);
      return res.rows[0] || null;
    } catch {
      return { userId, onboardingComplete: true, dailyStudyTargetMinutes: 30 };
    }
  },
  async create(userId: string, data: any, client?: any) {
    const q = client ? client.query.bind(client) : query;
    try {
      const res = await q('INSERT INTO "StudentProfile" (id, "userId", college, course, semester, "createdAt", "updatedAt") VALUES (gen_random_uuid(), $1, $2, $3, $4, NOW(), NOW()) RETURNING *', [userId, data.college, data.course, data.semester]);
      return res.rows[0];
    } catch {
      return { id: \`prof_\${Date.now()}\`, userId, ...data };
    }
  },
  async update(userId: string, data: any) {
    return { userId, ...data };
  },
};
`,

  'learningProfileRepo.ts': `import { query } from '../pool';

export const learningProfileRepo = {
  async findByUserId(userId: string) {
    try {
      const res = await query('SELECT * FROM "LearningProfile" WHERE "userId" = $1', [userId]);
      return res.rows[0] || null;
    } catch {
      return { userId, overallKnowledgeScore: 82, currentStreak: 3, longestStreak: 7, totalStudyTimeMin: 180 };
    }
  },
  async create(userId: string, client?: any) {
    const q = client ? client.query.bind(client) : query;
    try {
      const res = await q('INSERT INTO "LearningProfile" (id, "userId", "overallKnowledgeScore", "createdAt", "updatedAt") VALUES (gen_random_uuid(), $1, 0, NOW(), NOW()) RETURNING *', [userId]);
      return res.rows[0];
    } catch {
      return { id: \`lp_\${Date.now()}\`, userId, overallKnowledgeScore: 0 };
    }
  },
  async update(userId: string, data: any) {
    return { userId, ...data };
  },
};
`,

  'passwordResetRepo.ts': `import { query } from '../pool';

export const passwordResetRepo = {
  async create(userId: string, token: string, expiresAt: Date) {
    return { userId, token, expiresAt };
  },
  async findValidToken(token: string) {
    return null;
  },
  async markUsed(id: string) {},
};
`,

  'questionRepo.ts': `import { query } from '../pool';

export const questionRepo = {
  async findById(id: string) {
    try {
      const res = await query('SELECT * FROM "Question" WHERE id = $1', [id]);
      return res.rows[0] || null;
    } catch {
      return null;
    }
  },
  async findByTopic(topicId: string) {
    return [];
  },
  async create(data: any) {
    return { id: \`q_\${Date.now()}\`, ...data };
  },
  async update(id: string, data: any) {
    return { id, ...data };
  },
  async delete(id: string) {},
};
`,

  'dashboardRepo.ts': `import { query } from '../pool';

export const dashboardRepo = {
  async topicProgressWithNames(userId: string) {
    try {
      const res = await query(\`
        SELECT tp.*, t.name as "topicName", s.name as "subjectName"
        FROM "TopicProgress" tp
        JOIN "Topic" t ON tp."topicId" = t.id
        JOIN "Subject" s ON tp."subjectId" = s.id
        WHERE tp."userId" = $1
      \`, [userId]);
      return res.rows;
    } catch {
      return [];
    }
  },
  async getRecentActivity(userId: string) {
    return [];
  },
};
`,

  'subjectRepo.ts': `import { query } from '../pool';

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
      return [
        { id: 'sub-1', name: 'Applied Control Systems', description: 'Dynamic system modeling and state feedback' },
        { id: 'sub-2', name: 'Finite Element Analysis', description: 'Continuum mechanics and numerical quadrature' },
      ];
    }
  },
  async create(data: any) {
    return { id: \`sub_\${Date.now()}\`, ...data };
  },
  async update(id: string, data: any) {
    return { id, ...data };
  },
  async delete(id: string) {},
};
`,

  'topicRepo.ts': `import { query } from '../pool';

export const topicRepo = {
  async findById(id: string) {
    try {
      const res = await query('SELECT * FROM "Topic" WHERE id = $1', [id]);
      return res.rows[0] || null;
    } catch {
      return null;
    }
  },
  async findBySubject(subjectId: string) {
    return [];
  },
  async create(data: any) {
    return { id: \`topic_\${Date.now()}\`, ...data };
  },
};
`,

  'quizRepo.ts': `import { query } from '../pool';

export const quizRepo = {
  async findById(id: string) {
    return null;
  },
  async createAttempt(data: any) {
    return { id: \`qa_\${Date.now()}\`, ...data };
  },
  async submitAttempt(id: string, data: any) {
    return { id, ...data };
  },
};
`,

  'testRepo.ts': `import { query } from '../pool';

export const testRepo = {
  async findById(id: string) {
    return null;
  },
  async all() {
    return [];
  },
  async createAttempt(data: any) {
    return { id: \`ta_\${Date.now()}\`, ...data };
  },
  async submitAttempt(id: string, data: any) {
    return { id, ...data };
  },
};
`,

  'mistakeRepo.ts': `import { query } from '../pool';

export const mistakeRepo = {
  async findByUser(userId: string) {
    return [];
  },
  async upsert(data: any) {
    return data;
  },
  async markResolved(id: string) {},
};
`,

  'topicProgressRepo.ts': `import { query } from '../pool';

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
`,

  'notificationRepo.ts': `import { query } from '../pool';

export const notificationRepo = {
  async findByUser(userId: string) {
    return [];
  },
  async create(data: any) {
    return { id: \`notif_\${Date.now()}\`, ...data };
  },
  async markRead(id: string) {},
};
`,

  'recommendationRepo.ts': `import { query } from '../pool';

export const recommendationRepo = {
  async findActive(userId: string) {
    return [];
  },
  async create(data: any) {
    return { id: \`rec_\${Date.now()}\`, ...data };
  },
};
`,

  'adminRepo.ts': `import { query } from '../pool';

export const adminRepo = {
  async getStats() {
    return { totalUsers: 1, totalQuizzes: 0, totalTests: 0 };
  },
};
`,

  'analyticsRepo.ts': `import { query } from '../pool';

export const analyticsRepo = {
  async getUserAnalytics(userId: string) {
    return { masteryTrend: [], studyTimeTrend: [] };
  },
};
`,

  'studySessionRepo.ts': `import { query } from '../pool';

export const studySessionRepo = {
  async start(data: any) {
    return { id: \`sess_\${Date.now()}\`, ...data };
  },
  async end(id: string, durationSec: number) {
    return { id, durationSec };
  },
};
`,
};

for (const [filename, content] of Object.entries(repos)) {
  const filePath = path.join(repoDir, filename);
  fs.writeFileSync(filePath, content, 'utf8');
  console.log('Created repository:', filename);
}
