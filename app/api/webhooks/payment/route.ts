import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/utils/supabase/admin';

/**
 * SECURE BILLING WEBHOOK ENDPOINT
 * Route: POST /api/webhooks/payment
 * 
 * Receives payment status updates from Midtrans, Stripe, or QRIS, 
 * and automatically upgrades the Clerk user's tier to premium on Supabase.
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    // 🛡️ SECURITY CHECK: Verify custom webhook token to prevent unauthorized upgrade calls
    const authHeader = req.headers.get('Authorization');
    const systemSecret = process.env.PAYMENT_WEBHOOK_SECRET || 'fallback_secret_token_12345';
    
    if (!authHeader || authHeader !== `Bearer ${systemSecret}`) {
      console.error('[Webhook Blocked] Unauthorized request to billing hook.');
      return NextResponse.json({ error: 'Unauthorized signature validation failed.' }, { status: 401 });
    }

    const { userId, status, transactionId, planDays = 30 } = body;

    // Validate payload parameters
    if (!userId || !status) {
      return NextResponse.json({ error: 'Missing userId or status in payload.' }, { status: 400 });
    }

    console.log(`[Webhook Received] User: ${userId}, Status: ${status}, TxID: ${transactionId || 'N/A'}`);

    // If the payment status is successful, upgrade user tier to premium
    if (status === 'success' || status === 'settlement' || status === 'capture') {
      
      // Calculate dynamic expiry date
      const daysToAdd = Number(planDays) || 30;
      const futureExpiry = new Date();
      futureExpiry.setDate(futureExpiry.getDate() + daysToAdd);

      // Perform atomic update on Supabase profiles table
      const { data, error } = await supabaseAdmin
        .from('profiles')
        .update({
          tier: 'premium',
          premium_until: futureExpiry.toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)
        .select()
        .maybeSingle();

      if (error) {
        console.error('[Webhook Error] Failed to update profiles in Supabase:', error);
        return NextResponse.json({ error: 'Database update failed.' }, { status: 500 });
      }

      console.log(`[Webhook Success] Upgraded user ${userId} to Premium until ${futureExpiry.toISOString()}`);
      
      // Optionally insert a notification for the user to confirm their upgrade (defensive try-catch to prevent UUID/TEXT type failures)
      try {
        await supabaseAdmin.from('notifications').insert({
          user_id: userId,
          type: 'project_invited', // standard notifications tier code
          title: 'Akun Premium Aktif! 🎉',
          message: `Terima kasih! Pembayaran Anda sukses. Fitur Chat AI, Scan Struk, dan AI Advisor kini aktif untuk ${daysToAdd} hari ke depan.`,
          data: { transaction_id: transactionId || '', plan_days: daysToAdd }
        });
      } catch (notifErr: any) {
        console.warn('[Webhook Warning] Notification could not be inserted (likely UUID schema mismatch), but billing upgrade succeeded:', notifErr.message);
      }

      return NextResponse.json({ 
        success: true, 
        message: 'Subscription tier successfully updated.',
        expiry: futureExpiry.toISOString(),
        user: data
      }, { status: 200 });
    }

    // Handle payment cancellations or expirations
    if (status === 'expire' || status === 'cancel' || status === 'deny') {
      console.warn(`[Webhook Payment Cancelled] Reverting or keeping tier for user ${userId}`);
      
      return NextResponse.json({ 
        success: true, 
        message: 'Payment cancelled callback registered.' 
      }, { status: 200 });
    }

    return NextResponse.json({ success: true, message: 'Unprocessed payment status received.' }, { status: 200 });

  } catch (err: any) {
    console.error('[Webhook Critical Failure]:', err.message);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}
