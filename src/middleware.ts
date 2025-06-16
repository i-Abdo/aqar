
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { auth } from '@/lib/firebase/admin'; // Using Firebase Admin SDK for token verification

const protectedRoutes = ['/dashboard', '/admin'];
const adminRoutes = ['/admin'];

export const runtime = 'nodejs'; // Force Node.js runtime

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionCookie = request.cookies.get('__session')?.value;

  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));
  const isAdminRoute = adminRoutes.some(route => pathname.startsWith(route));

  if (!isProtectedRoute) {
    return NextResponse.next();
  }

  // This check is critical. If `auth` is undefined here, it means firebase-admin failed to initialize.
  if (!auth) {
    console.error('CRITICAL FAILURE in middleware: Firebase Admin SDK `auth` service is NOT available (imported as undefined from admin.ts). This means Firebase Admin SDK did not initialize. This is likely due to missing or incorrect server-side environment variables (FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY). Protected routes will be inaccessible.');
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('redirect', pathname);
    const response = NextResponse.redirect(url);
    // It's good practice to clear a potentially invalid cookie if auth is broken.
    response.cookies.delete('__session'); 
    return response;
  }

  if (!sessionCookie) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('redirect', pathname);
    return NextResponse.redirect(url);
  }

  try {
    const decodedToken = await auth.verifySessionCookie(sessionCookie, true /** checkRevoked */);
    
    if (isAdminRoute) {
      // Fetch user record to check custom claims for admin status
      const userRecord = await auth.getUser(decodedToken.uid);
      if (!userRecord.customClaims?.admin) { 
         const url = request.nextUrl.clone();
         url.pathname = '/dashboard'; // Redirect non-admins trying to access admin routes
         console.log(`User ${decodedToken.uid} is not an admin. Redirecting from admin route ${pathname} to /dashboard.`);
         return NextResponse.redirect(url);
      }
    }
    
    // Pass down decoded token to server components if needed (optional)
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-decoded-token', JSON.stringify(decodedToken));
    
    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });

  } catch (error) {
    console.error('Auth middleware error during token verification or user lookup:', error);
    // If token verification fails (e.g., expired, revoked, invalid), clear the cookie and redirect to login.
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('redirect', pathname); // Preserve the intended destination
    const response = NextResponse.redirect(url);
    response.cookies.delete('__session'); // Clear the invalid session cookie
    return response;
  }
}

// Apply middleware to protected and admin routes
export const config = {
  matcher: ['/dashboard/:path*', '/admin/:path*'],
};
