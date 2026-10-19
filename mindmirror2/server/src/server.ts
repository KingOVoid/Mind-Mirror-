import { createApp } from './app';
import { env } from './config/env';
import { pool } from './db/pool';

async function main() {
  // Check database connection gracefully without crashing the whole server
  try {
    await pool.query('SELECT 1');
    console.log('Connected to PostgreSQL database successfully.');
  } catch (err: any) {
    console.warn('PostgreSQL database not currently reachable — starting API server in autonomous mode.');
  }

  const app = createApp();
  app.listen(env.PORT, () => {
    console.log(`Mind Mirror API listening on http://localhost:${env.PORT}`);
  });
}

main();
