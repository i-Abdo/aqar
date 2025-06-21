
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Regular expression to detect mobile user agents.
const MOBILE_USER_AGENT_REGEX = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const userAgent = request.headers.get('user-agent') || '';
  const isMobileDevice = MOBILE_USER_AGENT_REGEX.test(userAgent);

  // If the user is on a mobile device and is accessing the homepage,
  // redirect them to the signup page.
  if (isMobileDevice && pathname === '/') {
    const signupUrl = new URL('/signup', request.url);
    return NextResponse.redirect(signupUrl);
  }

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
