'use server';

import { supabaseAdmin } from '@/utils/supabase/admin';
import { auth } from '@clerk/nextjs/server';
import { requirePremium, PremiumRequiredError } from '@/lib/premium-gate';

export async function getQuickInsight() {
  try {
    const { userId } = await auth();
    if (!userId) return "Silakan login untuk melihat insight.";

    const { data: transactions } = await supabaseAdmin
      .from('transactions')
      .select('amount, type, description, created_at')
      .eq('created_by', userId)
      .order('created_at', { ascending: false })
      .limit(5);

    if (!transactions || transactions.length === 0) return "Belum ada transaksi untuk dianalisis.";

    const last = transactions[0];
    return `Transaksi terakhir: Rp ${last.amount.toLocaleString()} untuk ${last.description || 'tanpa kategori'}.`;
  } catch (error) {
    return "Gagal memuat insight.";
  }
}

export async function generateFinancialInsights() {
  try {
    // 🔒 Premium Gate: only accessible by premium users
    await requirePremium();

    const { userId } = await auth();
    if (!userId) throw new Error('Unauthorized');

    const [walletsRes, transRes] = await Promise.all([
      supabaseAdmin.from('wallets').select('*').eq('user_id', userId),
      supabaseAdmin.from('transactions').select('*, category:categories(name)').eq('created_by', userId).order('created_at', { ascending: false }).limit(20)
    ]);

    const context = `Wallets: ${JSON.stringify(walletsRes.data?.map(w => ({ n: w.name, b: w.balance })))}, Transactions: ${JSON.stringify(transRes.data?.map(t => ({ a: t.amount, t: t.type, d: t.description })))}`;

    let apiKey = process.env.ALIBABA_AI_API_KEY || '';
    apiKey = apiKey.replace(/['";\s]/g, '').trim();

    const payload = {
      model: "qwen-plus",
      messages: [
        { role: "system", content: "Anda adalah penasihat keuangan pribadi profesional. Berikan analisis singkat dan saran cerdas dalam Bahasa Indonesia berdasarkan data pengguna." },
        { role: "user", content: `Analisis data ini: ${context}` }
      ]
    };

    // Coba Endpoint Utama
    let response = await fetch('https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
      body: JSON.stringify(payload)
    });

    let aiResult = await response.json();

    // Coba Endpoint Internasional jika gagal
    if (aiResult.error && (aiResult.error.code === 'invalid_api_key' || aiResult.error.message.includes('API key'))) {
      response = await fetch('https://dashscope-intl.aliyuncs.com/compatible-mode/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
        body: JSON.stringify(payload)
      });
      aiResult = await response.json();
    }

    if (aiResult.error || !aiResult.choices || aiResult.choices.length === 0) {
      throw new Error(aiResult.error?.message || 'Gagal menghubungi AI Advisor.');
    }

    return { success: true, insights: aiResult.choices[0].message.content };
  } catch (error: any) {
    if (error.name === 'PremiumRequiredError') {
      return { success: false, error: 'PREMIUM_REQUIRED' };
    }
    console.error('Advisor generation failed:', error.message);
    return { success: false, error: error.message };
  }
}
