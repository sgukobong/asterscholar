import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    // Firebase auth is handled client-side
    // This middleware is kept for future server-side checks if needed
    return NextResponse.next();
}

export const config = {
    matcher: ['/co-pilot/:path*', '/paraphraser/:path*', '/reference-finder/:path*', '/dashboard/:path*'],
};
