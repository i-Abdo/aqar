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
    if (!auth) {
      console.error('Auth service in middleware is not available. Firebase Admin SDK might not have initialized correctly.');
      throw new Error('Auth service unavailable');
    }
    const decodedToken = await auth.verifySessionCookie(sessionCookie, true /** checkRevoked */);
    
    if (isAdminRoute) {
      const userRecord = await auth.getUser(decodedToken.uid);
      if (!userRecord.customClaims?.admin) { // Safe navigation
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
    console.error('Auth middleware error:', error);
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
