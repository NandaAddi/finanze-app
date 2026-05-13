'use server';

import { supabaseAdmin } from '@/utils/supabase/admin';
import { auth } from '@clerk/nextjs/server';

export async function analyzeReceipt(base64Image: string) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error('Unauthorized');

    const { data: categories } = await supabaseAdmin
      .from('categories')
      .select('*')
      .or(`created_by.eq.${userId},created_by.is.null`);

    let apiKey = process.env.ALIBABA_AI_API_KEY || '';
    apiKey = apiKey.replace(/['";\s]/g, '').trim();

    const payload = {
      model: "qwen-vl-plus",
      messages: [
        {
          role: "system",
          content: "Anda adalah OCR cerdas. Ekstrak rincian belanja dari struk. Kembalikan JSON objek dengan key 'transactions' berisi array: {amount, description, type: 'EXPENSE', categoryName}."
        },
        {
          role: "user",
          content: [
            { type: "text", text: `Kategori: ${categories?.map(c => c.name).join(', ')}. Ekstrak dari gambar ini.` },
            { type: "image_url", image_url: { url: `data:image/jpeg;base64,${base64Image}` } }
          ]
        }
      ],
      response_format: { type: "json_object" }
    };

    // Coba Endpoint Utama
    let response = await fetch('https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify(payload)
    });

    let aiResult = await response.json();

    // Coba Endpoint Internasional jika gagal
    if (aiResult.error && (aiResult.error.code === 'invalid_api_key' || aiResult.error.message.includes('API key'))) {
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

    if (aiResult.error || !aiResult.choices || aiResult.choices.length === 0) {
      throw new Error(aiResult.error?.message || 'Gagal menganalisis struk. Cek koneksi/API Key Vision Anda.');
    }

    const content = aiResult.choices[0].message.content;
    const data = JSON.parse(content);

    return { success: true, data };
  } catch (error: any) {
    console.error('Receipt analysis failed:', error.message);
    return { success: false, error: error.message };
  }
}
