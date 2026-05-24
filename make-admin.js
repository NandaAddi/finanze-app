/**
 * ==============================================================================
 * FINANZE ADMIN PROMOTION UTILITY SCRIPT
 * ==============================================================================
 * Jalankan script ini untuk menjadikan akun Anda sebagai Super Admin!
 * 
 * Penggunaan:
 * node make-admin.js <email-anda>
 * 
 * Contoh:
 * node make-admin.js nnvnxx.10@gmail.com
 */

const fs = require('fs');
const path = require('path');

// 1. Load CLERK_SECRET_KEY & Database URLs dari .env secara manual
function loadEnv() {
  const envPath = path.join(__dirname, '.env');
  if (!fs.existsSync(envPath)) {
    console.error('❌ File .env tidak ditemukan!');
    process.exit(1);
  }
  const content = fs.readFileSync(envPath, 'utf-8');
  const lines = content.split('\n');
  const env = {};
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const parts = trimmed.split('=');
    if (parts.length >= 2) {
      const key = parts[0].trim();
      const value = parts.slice(1).join('=').trim().replace(/^['"]|['"]$/g, '');
      env[key] = value;
    }
  }
  return env;
}

const env = loadEnv();
const CLERK_SECRET_KEY = env.CLERK_SECRET_KEY;

if (!CLERK_SECRET_KEY) {
  console.error('❌ CLERK_SECRET_KEY tidak ditemukan di file .env!');
  process.exit(1);
}

// 2. Baca argumen email / userId
const target = process.argv[2];
if (!target) {
  console.log('\n📖 Cara Penggunaan:');
  console.log('   node make-admin.js <email-atau-clerk-user-id>\n');
  console.log('   Contoh:');
  console.log('   node make-admin.js nnvnxx.10@gmail.com\n');
  process.exit(0);
}

async function run() {
  console.log(`\n🛡️  Memulai proses promosi admin untuk: "${target}"...\n`);
  
  let userId = '';
  let email = '';

  // Cek apakah input berupa User ID Clerk atau Email
  if (target.startsWith('user_')) {
    userId = target;
  } else {
    // Cari user berdasarkan email di Clerk
    email = target;
    console.log(`🔍 Mencari ID pengguna untuk email: ${email}...`);
    try {
      const response = await fetch(`https://api.clerk.com/v1/users?email_address=${encodeURIComponent(email)}`, {
        headers: {
          'Authorization': `Bearer ${CLERK_SECRET_KEY}`,
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Gagal mencari user di Clerk: ${errText}`);
      }

      const users = await response.json();
      if (!users || users.length === 0) {
        console.error(`❌ Tidak ada akun Clerk yang terdaftar dengan email: ${email}`);
        console.error(`💡 Pastikan email terdaftar dan dieja dengan benar.`);
        process.exit(1);
      }

      userId = users[0].id;
      console.log(`✅ User ditemukan! ID Clerk: "${userId}"`);
    } catch (e) {
      console.error('❌ Terjadi kesalahan saat mencari user:', e.message);
      process.exit(1);
    }
  }

  // 3. Update publicMetadata di Clerk
  console.log(`🚀 Menjadikan role "admin" di Clerk publicMetadata...`);
  try {
    const response = await fetch(`https://api.clerk.com/v1/users/${userId}/metadata`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${CLERK_SECRET_KEY}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        public_metadata: {
          role: 'admin',
          tier: 'premium' // Sekalian jadikan premium agar bisa menikmati seluruh fitur AI
        }
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Gagal memperbarui metadata Clerk: ${errText}`);
    }

    console.log('✅ Clerk publicMetadata berhasil diperbarui: { role: "admin", tier: "premium" }');
  } catch (e) {
    console.error('❌ Gagal memperbarui metadata di Clerk:', e.message);
    process.exit(1);
  }

  // 4. Update Database Supabase (Jadikan Premium & Sinkronkan metadata)
  // Kita bisa menggunakan REST API Supabase untuk meng-update profile secara langsung menggunakan Service Role Key agar bypass RLS!
  const SUPABASE_URL = env.NEXT_PUBLIC_SUPABASE_URL;
  const SUPABASE_SERVICE_ROLE_KEY = env.SUPABASE_SERVICE_ROLE_KEY;

  if (SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY) {
    console.log(`🚀 Mensinkronkan tier ke "premium" di database Supabase...`);
    try {
      const premiumUntil = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(); // +1 tahun
      const response = await fetch(`${SUPABASE_URL}/rest/v1/profiles?id=eq.${userId}`, {
        method: 'PATCH',
        headers: {
          'apikey': SUPABASE_SERVICE_ROLE_KEY,
          'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation'
        },
        body: JSON.stringify({
          tier: 'premium',
          premium_until: premiumUntil
        })
      });

      if (response.ok) {
        console.log('✅ Database Supabase berhasil diperbarui (Tier: premium, s/d 1 tahun ke depan).');
      } else {
        const errText = await response.text();
        console.warn('⚠️ Gagal memperbarui database secara langsung (bukan masalah besar, profil akan disinkronkan otomatis saat Anda masuk ke dasbor):', errText);
      }
    } catch (e) {
      console.warn('⚠️ Gagal sinkronisasi ke database:', e.message);
    }
  }

  console.log('\n🎉 ========================================================== 🎉');
  console.log('🔥 PROMOSI AKUN SUPER ADMIN BERHASIL! 🔥');
  console.log('------------------------------------------------------------');
  console.log(` Akun:   ${target}`);
  console.log(` Role:   admin 👑`);
  console.log(` Tier:   premium 💎`);
  console.log('------------------------------------------------------------');
  console.log('💡 Langkah Selanjutnya:');
  console.log('1. Log out dari aplikasi Finanze Anda jika Anda sedang login.');
  console.log('2. Log in kembali untuk memperbarui token autentikasi Anda.');
  console.log('3. Buka halaman "/admin" untuk masuk ke Admin Panel Finanze Anda!');
  console.log('🎉 ========================================================== 🎉\n');
}

run();
