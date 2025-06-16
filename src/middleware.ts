// src/middleware.ts (ULTRA-DIAGNOSTIC v6 - Basic Function)
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

console.log('[Middleware ULTRA-DIAGNOSTIC v6] src/middleware.ts is being loaded/evaluated.');

export function middleware(request: NextRequest) {
  console.log('[Middleware ULTRA-DIAGNOSTIC v6] Middleware function executed for path:', request.nextUrl.pathname);
  return NextResponse.next();
}

// NO 'export const config' for this diagnostic step.
// NO 'export const runtime' for this diagnostic step (let Next.js default or error if needed).

console.log('[Middleware ULTRA-DIAGNOSTIC v6] src/middleware.ts finished loading.');
