/**
 * Minimal migration runner.
 * Applies every migration.sql file under prisma/migrations/<name>/ in folder-name order,
 * tracking what has already been applied in a `_migrations` table so it is safe to re-run.
 *
 * Usage: node scripts/migrate.js
 */
require('dotenv').config();
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local'), override: true });
require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env.local'), override: true });
const { Client } = require('pg');

async function main() {
  const migrationsDir = path.join(__dirname, '..', 'prisma', 'migrations');
  if (!fs.existsSync(migrationsDir)) {
    console.log('No migrations directory found.');
    return;
  }

  const folders = fs
    .readdirSync(migrationsDir, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name)
    .sort();

  const dbUrl = process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL || '';
  const useSsl =
    process.env.NODE_ENV === 'production' ||
    dbUrl.includes('sslmode=require') ||
    dbUrl.includes('neon.tech') ||
    dbUrl.includes('supabase.co');

  const client = new Client({
    connectionString: dbUrl,
    ssl: useSsl ? { rejectUnauthorized: false } : undefined,
  });
  await client.connect();

  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS "_migrations" (
        name TEXT PRIMARY KEY,
        applied_at TIMESTAMPTZ NOT NULL DEFAULT now()
      );
    `);

    const { rows } = await client.query('SELECT name FROM "_migrations"');
    const applied = new Set(rows.map((r) => r.name));

    for (const folder of folders) {
      if (applied.has(folder)) {
        console.log(`✓ already applied: ${folder}`);
        continue;
      }
      const sqlPath = path.join(migrationsDir, folder, 'migration.sql');
      if (!fs.existsSync(sqlPath)) continue;
      const sql = fs.readFileSync(sqlPath, 'utf8');
      console.log(`→ applying: ${folder}`);
      await client.query('BEGIN');
      try {
        await client.query(sql);
        await client.query('INSERT INTO "_migrations" (name) VALUES ($1)', [folder]);
        await client.query('COMMIT');
        console.log(`✓ applied: ${folder}`);
      } catch (err) {
        await client.query('ROLLBACK');
        throw err;
      }
    }

    console.log('All migrations up to date.');
  } finally {
    await client.end();
  }
}

main().catch((err) => {
  console.error('Migration failed:', err.message);
  process.exit(1);
});
