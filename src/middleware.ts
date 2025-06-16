
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { auth } from '@/lib/firebase/admin'; // Using Firebase Admin SDK for token verification

const protectedRoutes = ['/dashboard', '/admin'];
const adminRoutes = ['/admin'];

export const runtime = 'nodejs'; 

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionCookie = request.cookies.get('__session')?.value;

  console.log(`Middleware triggered for path: ${pathname}`);

  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));
  const isAdminRoute = adminRoutes.some(route => pathname.startsWith(route));

  if (!isProtectedRoute) {
    console.log(`Path ${pathname} is not protected. Allowing request.`);
    return NextResponse.next();
  }

  if (!auth) {
    console.error('CRITICAL FAILURE in middleware: Firebase Admin SDK `auth` service is NOT available (imported as undefined from admin.ts). This means Firebase Admin SDK did not initialize. This is likely due to missing or incorrect server-side environment variables (FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY). Protected routes will be inaccessible.');
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('redirect', pathname);
    const response = NextResponse.redirect(url);
    response.cookies.delete('__session'); 
    return response;
  }
  console.log('Firebase Admin `auth` service is available in middleware.');


  if (!sessionCookie) {
    console.log(`No session cookie found for protected route ${pathname}. Redirecting to login.`);
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('redirect', pathname);
    return NextResponse.redirect(url);
  }
  console.log(`Session cookie found for protected route ${pathname}. Verifying...`);


  try {
    const decodedToken = await auth.verifySessionCookie(sessionCookie, true /** checkRevoked */);
    console.log(`Session cookie verified for user: ${decodedToken.uid}`);
    
    if (isAdminRoute) {
      console.log(`Path ${pathname} is an admin route. Checking admin claims for user ${decodedToken.uid}...`);
      const userRecord = await auth.getUser(decodedToken.uid);
      if (!userRecord.customClaims?.admin) { 
         const url = request.nextUrl.clone();
         url.pathname = '/dashboard'; 
         console.warn(`User ${decodedToken.uid} is NOT an admin. Redirecting from admin route ${pathname} to /dashboard.`);
         return NextResponse.redirect(url);
      }
      console.log(`User ${decodedToken.uid} IS an admin. Allowing access to ${pathname}.`);
    }
    
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-decoded-token', JSON.stringify(decodedToken));
    
    console.log(`Allowing access for user ${decodedToken.uid} to protected route ${pathname}.`);
    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });

  } catch (error: any) {
    console.error(`Auth middleware error during token verification or user lookup for path ${pathname}:`, error.message, error.code);
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('redirect', pathname); 
    const response = NextResponse.redirect(url);
    response.cookies.delete('__session'); 
    return response;
  }
}

export const config = {
  matcher: ['/dashboard/:path*', '/admin/:path*'],
};
