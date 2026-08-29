const { migrate } = require('drizzle-orm/postgres-js/migrator');
const { drizzle } = require('drizzle-orm/postgres-js');
const postgres = require('postgres');
const path = require('path');

const sql = postgres('postgresql://user:password@localhost:5432/danmaku');
const db = drizzle(sql);

async function runMigrations() {
  try {
    console.log('Starting migrations...');
    await migrate(db, {
      migrationsFolder: path.join(__dirname, 'src/database/migrations'),
    });
    console.log('✓ Migrations completed successfully');
  } catch (err) {
    console.error('✗ Migration error:', err.message);
  } finally {
    await sql.end();
  }
}

runMigrations();
