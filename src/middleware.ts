import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Minimalistic middleware for diagnostic purposes.
// Firebase Admin SDK logic and imports are removed.
// The 'config' export for matcher is also completely removed.

export const runtime = 'nodejs';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  console.log(`[Middleware DIAGNOSTIC v2] Triggered for path: ${pathname}. This is a diagnostic version.`);
  console.log(`[Middleware DIAGNOSTIC v2] ALLOWING ALL REQUESTS for path: ${pathname} in diagnostic mode.`);
  return NextResponse.next();
}

// NOTE: The 'export const config = { matcher: ... }' block has been
// completely removed for this diagnostic step, not just commented out.
