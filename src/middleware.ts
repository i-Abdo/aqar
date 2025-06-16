
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

  if (!sessionCookie) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('redirect', pathname);
    return NextResponse.redirect(url);
  }

  try {
    // Critical check: Ensure Firebase Admin auth service is available
    if (!auth) {
      console.error('CRITICAL: Firebase Admin SDK `auth` service is NOT available in middleware. This indicates an initialization problem with `firebase-admin` likely due to missing/incorrect server-side environment variables. Protected routes will be inaccessible.');
      // Redirect to login, as auth cannot be verified
      const url = request.nextUrl.clone();
      url.pathname = '/login';
      url.searchParams.set('redirect', pathname);
      request.cookies.delete('__session'); 
      const response = NextResponse.redirect(url);
      response.cookies.delete('__session'); 
      return response;
    }

    const decodedToken = await auth.verifySessionCookie(sessionCookie, true /** checkRevoked */);
    
    if (isAdminRoute) {
      // Ensure customClaims exists before trying to access admin property
      const userRecord = await auth.getUser(decodedToken.uid);
      if (!userRecord.customClaims?.admin) { 
         const url = request.nextUrl.clone();
         url.pathname = '/dashboard'; // Redirect non-admins from admin routes
         return NextResponse.redirect(url);
      }
    }
    
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-decoded-token', JSON.stringify(decodedToken));
    
    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });

  } catch (error) {
    console.error('Auth middleware error during token verification or user lookup:', error);
    // Clear potentially invalid cookie and redirect to login
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('redirect', pathname);
    request.cookies.delete('__session'); 
    const response = NextResponse.redirect(url);
    response.cookies.delete('__session'); 
    return response;
  }
}

export const config = {
  matcher: ['/dashboard/:path*', '/admin/:path*'],
};
