const { Client } = require('pg');
const dotenv = require('dotenv');

dotenv.config();

const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL;

if (!connectionString) {
  console.error('Error: DATABASE_URL or DIRECT_URL is not defined in your environment variables (.env).');
  process.exit(1);
}

// Parse arguments
const args = process.argv.slice(2);
const searchKey = args[0]; // Can be Clerk ID or Email
const tier = args[1] || 'premium'; // 'premium' or 'free'
const durationDays = Number(args[2]) || 30; // Default 30 days

if (!searchKey) {
  console.log('\n🌟 FINANZE ADMIN USER UPGRADE UTILITY 🌟');
  console.log('Usage: node scripts/upgrade-user.js <email_or_clerk_id> [tier] [duration_days]\n');
  console.log('Examples:');
  console.log('  1. Upgrade user by email for 30 days (default):');
  console.log('     node scripts/upgrade-user.js user@example.com\n');
  console.log('  2. Upgrade user by Clerk ID for 365 days (1 year):');
  console.log('     node scripts/upgrade-user.js user_2NandaAddi premium 365\n');
  console.log('  3. Revert/Downgrade user back to free tier:');
  console.log('     node scripts/upgrade-user.js user@example.com free\n');
  process.exit(0);
}

async function run() {
  const client = new Client({ connectionString });
  await client.connect();

  try {
    console.log(`[Admin Lookup] Searching for profile matching: "${searchKey}"...`);
    
    // Find profile by email or id
    const findRes = await client.query(
      'SELECT id, email, full_name, tier, premium_until FROM public.profiles WHERE email = $1 OR id = $2',
      [searchKey, searchKey]
    );

    if (findRes.rows.length === 0) {
      console.error(`\x1b[31mError: No user profile found in database matching email or ID "${searchKey}".\x1b[0m`);
      return;
    }

    const user = findRes.rows[0];
    console.log(`Found User: ${user.full_name} (${user.email}) | ID: ${user.id} | Current Tier: ${user.tier.toUpperCase()}`);

    let premiumUntil = null;
    if (tier === 'premium') {
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + durationDays);
      premiumUntil = expiryDate.toISOString();
    }

    console.log(`\n[Admin Action] Updating user to tier: ${tier.toUpperCase()}${tier === 'premium' ? ` until ${premiumUntil} (${durationDays} days)` : ''}...`);

    // Perform database update
    await client.query(
      'UPDATE public.profiles SET tier = $1, premium_until = $2, updated_at = NOW() WHERE id = $3',
      [tier, premiumUntil, user.id]
    );

    // Insert confirmation log into notifications if possible
    try {
      const message = tier === 'premium' 
        ? `Akun Premium Anda telah diaktifkan oleh Administrator selama ${durationDays} hari.`
        : 'Status akun premium Anda telah berakhir atau dinonaktifkan.';
        
      await client.query(
        'INSERT INTO public.notifications (user_id, type, title, message, read, created_at, updated_at) VALUES ($1, $2, $3, $4, false, NOW(), NOW())',
        [user.id, 'project_invited', 'Update Status Langganan 🎉', message]
      );
    } catch (notifErr) {
      // safe fallback if notification UUID constraint blocks insert
      console.log(' (Notification log skipped due to task-tracker UUID schema mismatch - profile updated successfully)');
    }

    console.log(`\x1b[32m\nSUCCESS: Profile for ${user.full_name} successfully updated to ${tier.toUpperCase()}!\x1b[0m`);
    
    // Print updated row state
    const checkRes = await client.query('SELECT email, tier, premium_until FROM public.profiles WHERE id = $1', [user.id]);
    console.log(checkRes.rows[0]);

  } catch (err) {
    console.error('\x1b[31mDatabase operation failed:\x1b[0m', err.message);
  } finally {
    await client.end();
  }
}

run();
