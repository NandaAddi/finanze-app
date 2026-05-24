const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL;

if (!connectionString) {
  console.error('Error: DATABASE_URL or DIRECT_URL is not set in .env');
  process.exit(1);
}

async function run() {
  console.log('Connecting to database...');
  const client = new Client({ connectionString });
  await client.connect();

  try {
    const migrationPath = path.join(__dirname, '../supabase/migrations/20260525_admin_role.sql');
    console.log(`Reading migration from ${migrationPath}...`);
    const sql = fs.readFileSync(migrationPath, 'utf8');

    console.log('Applying migration...');
    await client.query(sql);
    console.log('Migration applied successfully!');
  } catch (err) {
    console.error('Failed to apply migration:', err);
  } finally {
    await client.end();
  }
}

run();
