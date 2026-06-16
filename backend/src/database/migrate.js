const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 1,
});

async function getAppliedMigrations() {
  try {
    const { rows } = await pool.query(
      'SELECT filename FROM schema_migrations ORDER BY filename'
    );
    return new Set(rows.map(r => r.filename));
  } catch {
    return new Set();
  }
}

async function applyMigration(filename, sql) {
  const client = await pool.connect();
  try {
    const start = Date.now();
    await client.query('BEGIN');
    await client.query(sql);
    await client.query(
      `INSERT INTO schema_migrations (filename, checksum, duration_ms)
       VALUES ($1, $2, $3)`,
      [filename, '', Date.now() - start]
    );
    await client.query('COMMIT');
    console.log(`  ✓ ${filename}`);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(`  ✗ ${filename}: ${err.message}`);
    process.exit(1);
  } finally {
    client.release();
  }
}

async function migrate() {
  const migrationsDir = path.resolve(__dirname, 'migrations');
  const files = fs.readdirSync(migrationsDir)
    .filter(f => f.endsWith('.sql'))
    .sort();

  const applied = await getAppliedMigrations();

  // Ensure tracking table exists (apply 017 first if not)
  const trackingFile = '20240610_000017_migration_tracking.sql';
  if (!applied.has(trackingFile)) {
    const trackingSql = fs.readFileSync(
      path.join(migrationsDir, trackingFile), 'utf-8'
    );
    await applyMigration(trackingFile, trackingSql);
    applied.add(trackingFile);
  }

  for (const file of files) {
    if (applied.has(file)) {
      console.log(`  - ${file} (already applied)`);
      continue;
    }

    const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf-8');
    await applyMigration(file, sql);
  }

  console.log('\nAll migrations applied successfully.');
  await pool.end();
}

migrate().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});
