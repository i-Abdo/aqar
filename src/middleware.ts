// src/middleware.ts (ULTRA-SIMPLIFIED DIAGNOSTIC - NO FIREBASE, NO MATCHER)
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export const runtime = 'nodejs'; // Keep this as it's generally needed

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  console.log(`[Middleware ULTRA-SIMPLIFIED DIAGNOSTIC] Triggered for path: ${pathname}.`);
  
  // NO Firebase Admin SDK logic
  // NO imports from src/lib/firebase/admin.ts

  console.log(`[Middleware ULTRA-SIMPLIFIED DIAGNOSTIC] ALLOWING ALL REQUESTS for path: ${pathname}.`);
  return NextResponse.next();
}

// CRITICAL: NO 'export const config = { matcher: ... }' block
console.log('[Middleware ULTRA-SIMPLIFIED DIAGNOSTIC] middleware.ts loaded.');
