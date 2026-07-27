import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
  const token = req.cookies.get('refreshToken');
  const isAuthPage = req.nextUrl.pathname.startsWith('/auth/');
  const isPortal = req.nextUrl.pathname.startsWith('/portal');
  
  // If no refresh token is present, protect portal routes
  if (!token && isPortal) {
    return NextResponse.redirect(new URL('/auth/login', req.url));
  }

  // If user is already logged in, redirect them away from auth pages
  if (token && isAuthPage && !req.nextUrl.pathname.includes('/verify-email') && !req.nextUrl.pathname.includes('/accept-invitation')) {
    return NextResponse.redirect(new URL('/portal/author', req.url));
  }

  // Note: Detailed role-based routing (e.g. stopping an AUTHOR from viewing /portal/admin)
  // is handled client-side in the page components themselves, since the refreshToken
  // is opaque and the actual JWT access token is stored in memory.

  return NextResponse.next();
}

export const config = {
  matcher: ['/portal/:path*', '/auth/:path*'],
};
