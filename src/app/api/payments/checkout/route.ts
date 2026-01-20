import { NextRequest, NextResponse } from 'next/server';
import { DodoPayments } from 'dodopayments';

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

        // TODO: Get user from Firebase Auth token
        // For now, using a placeholder email
        const userEmail = 'user@example.com';

        const session = await dodoClient.checkoutSessions.create({
            productCart: [{ productId, quantity: 1 }],
            customer: { email: userEmail },
            returnUrl: 'http://localhost:3000/?upgrade=success',
            metadata: { userId: 'placeholder' },
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
