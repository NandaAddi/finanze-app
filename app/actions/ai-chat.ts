'use server';

import { supabaseAdmin } from '@/utils/supabase/admin';
import { auth } from '@clerk/nextjs/server';
import { createTransaction } from './finance';
import { requirePremium } from '@/lib/premium-gate';

export async function parseAndCreateTransactions(text: string, walletId: string) {
  try {
    // 🔒 Premium Gate
    await requirePremium();

    const { userId } = await auth();
    if (!userId) throw new Error('Unauthorized');

    const { data: categories } = await supabaseAdmin
      .from('categories')
      .select('*')
      .or(`created_by.eq.${userId},created_by.is.null`);

    // 1. Ambil dan bersihkan API Key
    let apiKey = process.env.ALIBABA_AI_API_KEY || '';
    apiKey = apiKey.replace(/['";\s]/g, '').trim(); // Hapus tanda kutip, titik koma, atau spasi jika ada

    if (!apiKey) {
      throw new Error('ALIBABA_AI_API_KEY tidak ditemukan di environment.');
    }

    // DIAGNOSTIK: Cek 4 karakter awal & akhir di terminal
    console.log(`[AI-Audit] Mencoba memanggil Alibaba dengan Key: ${apiKey.substring(0, 4)}...${apiKey.substring(apiKey.length - 4)}`);

    const payload = {
      model: "qwen-turbo",
      messages: [
        {
          role: "system",
          content: `Anda adalah asisten pencatat keuangan. Ekstrak data transaksi. Kategori: ${categories?.map(c => c.name).join(', ')}. Format JSON: {"transactions": [{"amount": number, "type": "EXPENSE"|"INCOME", "description": string, "categoryName": string}]}`
        },
        { role: "user", content: `Teks: "${text}"` }
      ],
      response_format: { type: "json_object" }
    };

    // 2. Coba Endpoint Utama (DashScope China)
    let response = await fetch('https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify(payload)
    });

    let aiResult = await response.json();

    // 3. Jika gagal karena API Key, coba Endpoint Internasional
    if (aiResult.error && (aiResult.error.code === 'invalid_api_key' || aiResult.error.message.includes('API key'))) {
      console.log('[AI-Audit] Gagal di endpoint China, mencoba endpoint Internasional...');
      
      response = await fetch('https://dashscope-intl.aliyuncs.com/compatible-mode/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify(payload)
      });
      aiResult = await response.json();
    }

    if (aiResult.error) {
      console.error('[AI-Audit] Alibaba Error Akhir:', aiResult.error);
      throw new Error(`Alibaba Error: ${aiResult.error.message} (${aiResult.error.code})`);
    }

    const content = aiResult.choices[0].message.content;
    const parsed = JSON.parse(content);
    const parsedData = parsed.transactions || [];

    for (const item of parsedData) {
      const category = categories?.find(c => c.name.toLowerCase() === item.categoryName.toLowerCase()) || 
                       categories?.find(c => c.name === 'Others') ||
                       categories?.[0];
      
      if (category) {
        await createTransaction({
          amount: Number(item.amount),
          type: item.type,
          description: item.description,
          wallet_id: walletId,
          category_id: category.id,
        });
      }
    }

    return { success: true, count: parsedData.length, data: parsedData };
  } catch (error: any) {
    if (error.name === 'PremiumRequiredError') {
      return { success: false, error: 'PREMIUM_REQUIRED', count: 0 };
    }
    console.error('[AI-Audit] Gagal Total:', error.message);
    return { success: false, error: error.message, count: 0 };
  }
}
