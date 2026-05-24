const { Client } = require('pg');
const dotenv = require('dotenv');

dotenv.config();

const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL;

async function run() {
  const client = new Client({ connectionString });
  await client.connect();

  try {
    const res = await client.query('SELECT id, email, full_name, role, tier FROM public.profiles ORDER BY created_at DESC');
    console.log('--- USER PROFILES IN DATABASE ---');
    console.log(res.rows);
  } catch (err) {
    console.error(err);
  } finally {
    await client.end();
  }
}

run();
