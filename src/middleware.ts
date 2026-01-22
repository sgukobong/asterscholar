import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
    let response = NextResponse.next({
        request: {
            headers: request.headers,
        },
    });

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                get(name: string) {
                    return request.cookies.get(name)?.value;
                },
                set(name: string, value: string, options: any) {
                    request.cookies.set({
                        name,
                        value,
                        ...options,
                    });
                    response = NextResponse.next({
                        request: {
                            headers: request.headers,
                        },
                    });
                    response.cookies.set({
                        name,
                        value,
                        ...options,
                    });
                },
                remove(name: string, options: any) {
                    request.cookies.set({
                        name,
                        value: '',
                        ...options,
                    });
                    response = NextResponse.next({
                        request: {
                            headers: request.headers,
                        },
                    });
                    response.cookies.set({
                        name,
                        value: '',
                        ...options,
                    });
                },
            },
        }
    );

    const { data: { session } } = await supabase.auth.getSession();

    // If no session: allow a small number of anonymous uses (tracked via cookie)
    if (!session) {
        // Allow anonymous users up to N uses before forcing login
        const MAX_ANON_USES = 20;

        // Don't apply anon allowance to the login page itself
        if (request.nextUrl.pathname !== '/login') {
            const anonCookie = request.cookies.get('anon_uses')?.value;
            const anonCount = anonCookie ? parseInt(anonCookie, 1) || 0 : 0;

            if (anonCount >= MAX_ANON_USES) {
                const redirectUrl = request.nextUrl.clone();
                redirectUrl.pathname = '/login';
                return NextResponse.redirect(redirectUrl);
            }

            // Increment anonymous usage count and set cookie (server sets httpOnly)
            const newCount = anonCount + 1;
            response.cookies.set({ name: 'anon_uses', value: String(newCount), path: '/', httpOnly: true, maxAge: 60 * 60 * 24 * 30 });
            // allow the request to proceed for this anonymous use
            return response;
        }
    }

    // If has session and trying to access login, redirect to home
    if (session && request.nextUrl.pathname === '/login') {
        const redirectUrl = request.nextUrl.clone();
        redirectUrl.pathname = '/';
        return NextResponse.redirect(redirectUrl);
    }

    return response;
}

export const config = {
    matcher: ['/co-pilot/:path*', '/paraphraser/:path*', '/reference-finder/:path*', '/dashboard/:path*', '/login'],
};
