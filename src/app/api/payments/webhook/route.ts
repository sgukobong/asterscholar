import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

// Map Dodo product IDs to your internal subscription tiers
const PRODUCT_TO_TIER: Record<string, string> = {
  'pdt_0NWpedFEGqCX15ECA9mUQ': 'scholar',
};

function safeJsonParse(raw: string) {
  try {
    return JSON.parse(raw);
  } catch (e) {
    return null;
  }
}

function extractUserId(payload: any): string | null {
  // Try several common locations for metadata.userId used when creating the session
  return (
    payload?.data?.object?.metadata?.userId ||
    payload?.data?.object?.session?.metadata?.userId ||
    payload?.session?.metadata?.userId ||
    payload?.metadata?.userId ||
    payload?.data?.metadata?.userId ||
    null
  );
}

function extractProductId(payload: any): string | null {
  // Dodo's payload shapes may vary; try several plausible locations
  return (
    payload?.data?.object?.productId ||
    payload?.data?.object?.line_items?.[0]?.productId ||
    payload?.data?.object?.items?.[0]?.productId ||
    payload?.session?.cart?.[0]?.productId ||
    payload?.metadata?.productId ||
    null
  );
}

export async function POST(request: Request) {
  const raw = await request.text();

  // Verify signature if secret is configured
  const webhookSecret = process.env.DODO_WEBHOOK_SECRET;
  const signatureHeader = request.headers.get('x-dodo-signature') || request.headers.get('x-signature');

  if (webhookSecret && signatureHeader) {
    try {
      const hmac = crypto.createHmac('sha256', webhookSecret);
      hmac.update(raw);
      const expected = hmac.digest('hex');

      // support signatures with prefix or full hex
      if (!signatureHeader.includes(expected) && signatureHeader !== expected) {
        console.warn('Webhook signature mismatch');
        return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
      }
    } catch (err) {
      console.warn('Error verifying webhook signature:', err);
      return NextResponse.json({ error: 'Signature verification failed' }, { status: 400 });
    }
  }

  const payload = safeJsonParse(raw);
  if (!payload) {
    return NextResponse.json({ error: 'Invalid JSON payload' }, { status: 400 });
  }

  // Determine event type and check for successful payment / checkout
  const eventType = payload.type || payload.event || payload.event_type || payload.data?.type || '';
  const isSuccessful = /checkout.*(completed|succeeded)|payment.*(succeeded|completed)/i.test(eventType) || /succeeded|completed|paid/i.test(payload?.status || payload?.data?.object?.status || '');

  const userId = extractUserId(payload);
  const productId = extractProductId(payload);

  if (!isSuccessful) {
    // Not a finalization event - ack and ignore
    return NextResponse.json({ received: true, note: 'Ignored non-final event', eventType }, { status: 200 });
  }

  if (!userId) {
    console.warn('Webhook event missing metadata.userId or unknown payload shape', payload);
    return NextResponse.json({ error: 'Missing user identifier in webhook payload' }, { status: 400 });
  }

  // Determine subscription tier from product id (fallback to 'scholar' if productId missing)
  const tier = (productId && PRODUCT_TO_TIER[productId]) || 'scholar';

  // Update Supabase user profile using service role key (server-side)
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    console.error('Missing Supabase service role key or URL. Cannot update user.');
    return NextResponse.json({ error: 'Server misconfiguration' }, { status: 500 });
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey);

  try {
    // Update the users table. This will succeed if the users table exists and id column matches.
    const updates: any = { subscription_tier: tier };
    // Optionally store product/payment metadata if available
    if (productId) updates.last_product_id = productId;
    if (payload?.data?.object?.amount || payload?.data?.object?.total) updates.last_payment_amount = payload?.data?.object?.amount || payload?.data?.object?.total;
    updates.last_payment_at = new Date().toISOString();

    const { error } = await supabase.from('users').update(updates).eq('id', userId);

    if (error) {
      console.warn('Failed to update user subscription in Supabase:', error.message || error);
      return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
    }

    console.log(`User ${userId} upgraded to ${tier} via product ${productId || 'unknown'}`);
    return NextResponse.json({ received: true }, { status: 200 });
  } catch (err) {
    console.error('Webhook handling error:', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
