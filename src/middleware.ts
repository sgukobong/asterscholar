import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    const authCookie = request.cookies.get('asterscholar_auth');
    const { pathname } = request.nextUrl;

    // Protect sensitive routes
    const protectedRoutes = ['/co-pilot', '/paraphraser', '/reference-finder', '/dashboard'];

    if (protectedRoutes.some(route => pathname.startsWith(route))) {
        if (!authCookie) {
            // Redirect to login if no auth cookie
            const loginUrl = new URL('/login', request.url);
            return NextResponse.redirect(loginUrl);
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/co-pilot/:path*', '/paraphraser/:path*', '/reference-finder/:path*', '/dashboard/:path*'],
};
