'use server';

import { supabaseAdmin } from '@/utils/supabase/admin';
import { auth } from '@clerk/nextjs/server';

/**
 * Safely parse JSON that may be wrapped in markdown code fences by the AI.
 * Example inputs the AI might return:
 *   - ```json\n{"transactions": [...]}\n```
 *   - {"transactions": [...]}
 *   - Some explanation text {"transactions": [...]} more text
 */
function safeParseAIJson(content: string): any {
  // 1. Strip markdown code fences (```json ... ``` or ``` ... ```)
  let cleaned = content
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim();

  // 2. Try direct parse first
  try {
    return JSON.parse(cleaned);
  } catch {}

  // 3. Try to extract the first {...} object from the string
  const start = cleaned.indexOf('{');
  const end = cleaned.lastIndexOf('}');
  if (start !== -1 && end !== -1 && end > start) {
    try {
      return JSON.parse(cleaned.substring(start, end + 1));
    } catch {}
  }

  throw new Error('AI tidak dapat mengekstrak data dari struk. Coba foto yang lebih jelas dan terang.');
}

export async function analyzeReceipt(base64Image: string) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error('Unauthorized');

    const { data: categories } = await supabaseAdmin
      .from('categories')
      .select('*')
      .or(`created_by.eq.${userId},created_by.is.null`);

    const apiKey = (process.env.ALIBABA_AI_API_KEY || '').replace(/['";\s]/g, '').trim();
    if (!apiKey) {
      throw new Error('API Key Vision AI belum dikonfigurasi. Hubungi administrator.');
    }

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
            { type: "text", text: `Kategori tersedia: ${categories?.map(c => c.name).join(', ') || 'Others'}. Ekstrak transaksi dari gambar ini.` },
            { type: "image_url", image_url: { url: `data:image/jpeg;base64,${base64Image}` } }
          ]
        }
      ],
      response_format: { type: "json_object" }
    };

    const endpoints = [
      'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions',
      'https://dashscope-intl.aliyuncs.com/compatible-mode/v1/chat/completions',
    ];

    let aiResult: any = null;
    let lastError = '';

    for (const endpoint of endpoints) {
      try {
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
          },
          body: JSON.stringify(payload)
        });

        if (!response.ok && response.status !== 200) {
          lastError = `Server AI merespons dengan status ${response.status}`;
          continue;
        }

        const result = await response.json();

        // Skip to fallback endpoint only on API key errors
        if (result.error) {
          const msg = result.error.message || '';
          lastError = msg;
          if (msg.toLowerCase().includes('api key') || result.error.code === 'invalid_api_key') {
            continue; // try next endpoint
          }
          throw new Error(`Gagal memproses struk: ${msg}`);
        }

        aiResult = result;
        break; // success — stop trying more endpoints
      } catch (fetchError: any) {
        // Network-level errors (no internet, DNS, etc.)
        if (fetchError.message?.includes('fetch')) {
          lastError = 'Tidak dapat terhubung ke server AI. Periksa koneksi internet Anda.';
          continue;
        }
        throw fetchError; // re-throw non-network errors
      }
    }

    if (!aiResult || !aiResult.choices || aiResult.choices.length === 0) {
      throw new Error(lastError || 'Gagal mendapatkan respons dari AI. Coba lagi beberapa saat.');
    }

    const content = aiResult.choices[0].message?.content;
    if (!content) {
      throw new Error('AI tidak mengembalikan hasil analisis. Pastikan foto struk terlihat jelas.');
    }

    // Use safe parser — this is what previously caused the "Unexpected token" error
    const data = safeParseAIJson(content);

    if (!data.transactions || !Array.isArray(data.transactions) || data.transactions.length === 0) {
      throw new Error('Tidak ada transaksi yang terdeteksi. Pastikan foto menampilkan struk dengan jelas.');
    }

    return { success: true, data };
  } catch (error: any) {
    console.error('[Receipt Analysis Error]:', error.message);
    // Return a clean user-facing message, never a raw JS error object
    return {
      success: false,
      error: error.message || 'Terjadi kesalahan yang tidak terduga. Coba lagi atau pilih foto yang berbeda.'
    };
  }
}

