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
    const decodedToken = await auth.verifySessionCookie(sessionCookie, true /** checkRevoked */);
    // Attach user info to request if needed, or just verify
    // const user = await auth.getUser(decodedToken.uid); // For more user details like custom claims

    if (isAdminRoute) {
      const userRecord = await auth.getUser(decodedToken.uid);
      if (!userRecord.customClaims?.admin) {
         const url = request.nextUrl.clone();
         url.pathname = '/dashboard'; // Redirect non-admins from admin routes
         return NextResponse.redirect(url);
      }
    }
    
    // Clone the request headers and set a new header `x-decoded-token`
    // This is one way to pass user info to Server Components, though direct session access is often preferred.
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
    request.cookies.delete('__session'); // Clear invalid cookie
    const response = NextResponse.redirect(url);
    response.cookies.delete('__session'); // Ensure cookie is cleared on client too
    return response;
  }
}

export const config = {
  matcher: ['/dashboard/:path*', '/admin/:path*'],
};
