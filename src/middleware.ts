
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// IMPORTANT: Temporarily remove all Firebase-related imports and logic for diagnosis.
// We are trying to determine if Next.js can load the middleware file itself.
// import { auth } from '@/lib/firebase/admin';

// const protectedRoutes = ['/dashboard', '/admin'];
// const adminRoutes = ['/admin'];

export const runtime = 'nodejs'; 

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  console.log(`[Middleware DIAGNOSTIC] Triggered for path: ${pathname}. This is a diagnostic version with Firebase logic REMOVED.`);

  // For diagnosis, we are not checking auth or protecting routes.
  // This is purely to confirm if the middleware file itself can be loaded by Next.js.

  console.log(`[Middleware DIAGNOSTIC] ALLOWING ALL REQUESTS for path: ${pathname} in diagnostic mode.`);
  return NextResponse.next();
}
