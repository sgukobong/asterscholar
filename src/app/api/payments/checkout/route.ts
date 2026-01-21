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

        const session = await dodoClient.checkoutSessions.create({
            productCart: [{ productId, quantity: 1 }],
            customer: { email: user.email! },
            returnUrl: 'http://localhost:3000/?upgrade=success',
            metadata: { userId: user.id },
        });

        return NextResponse.json({ checkout_url: session.checkoutUrl });
    } catch (error: any) {
        console.error('Checkout error:', error);
        return NextResponse.json(
            { error: 'Failed to create checkout session' },
            { status: 500 }
        );
    }
}
