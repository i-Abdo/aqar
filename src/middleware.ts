// src/middleware.ts (ULTRA-DIAGNOSTIC v6 - Basic Function with Matcher)
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

console.log('[Middleware ULTRA-DIAGNOSTIC v6] src/middleware.ts is being loaded/evaluated.');

export function middleware(request: NextRequest) {
  console.log('[Middleware ULTRA-DIAGNOSTIC v6] Middleware function executed for path:', request.nextUrl.pathname);
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};

console.log('[Middleware ULTRA-DIAGNOSTIC v6] src/middleware.ts finished loading with matcher config.');
