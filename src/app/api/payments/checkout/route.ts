import { NextRequest, NextResponse } from 'next/server';
import { DodoPayments } from 'dodopayments';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

const dodoClient = new DodoPayments({
    bearerToken: process.env.DODO_API_KEY!,
    environment: 'test_mode',
});

export async function POST(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const productId = searchParams.get('product_id');

        if (!productId) {
            return NextResponse.json({ error: 'Product ID required' }, { status: 400 });
        }

        // Whitelist allowed product IDs to prevent abuse
        const ALLOWED_PRODUCT_IDS = new Set(["pdt_0NWpedFEGqCX15ECA9mUQ"]);
        if (!ALLOWED_PRODUCT_IDS.has(productId)) {
            return NextResponse.json({ error: 'Invalid product_id' , details: `product_id ${productId} not allowed`}, { status: 400 });
        }

        // Get user from Supabase Auth
        const cookieStore = await cookies();
        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                cookies: {
                    get(name: string) {
                        return cookieStore.get(name)?.value;
                    },
                },
            }
        );

        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        try {
            const session = await dodoClient.checkoutSessions.create({
                product_cart: [{ product_id: productId, quantity: 1 }],
                customer: {
                    email: user.email!,
                    name: (user.user_metadata as any)?.full_name || user.email!.split('@')[0],
                },
                return_url: 'http://localhost:3000/?upgrade=success',
                metadata: { userId: user.id, productId },
            });

            // dodo response shape may use checkoutUrl or checkout_url (or other keys).
            const checkoutUrl = (session as any).checkoutUrl || (session as any).checkout_url || (session as any).url || null;

            if (!checkoutUrl) {
                console.error('Dodo checkout session created but no checkout URL returned', { session });
                return NextResponse.json({ error: 'No checkout URL returned by payment provider', details: session }, { status: 502 });
            }

            return NextResponse.json({ checkout_url: checkoutUrl });
        } catch (err: any) {
            console.error('Dodo SDK error creating checkout session:', err);
            // Return more detailed error to the client to help debugging in dev.
            return NextResponse.json({ error: 'Failed to create checkout session', details: err?.message || String(err) }, { status: 500 });
        }
    } catch (error: any) {
        console.error('Checkout error:', error);
        return NextResponse.json(
            { error: 'Failed to create checkout session', details: error?.message || String(error) },
            { status: 500 }
        );
    }
}
