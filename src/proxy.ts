import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Next.js 16 Proxy (formerly middleware)
 * Protects administrative routes using Better Auth session verification.
 */
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const sessionToken =
    request.cookies.get('better-auth.session_token')?.value ||
    request.cookies.get('__Secure-better-auth.session_token')?.value;

  // 1. Always allow public admin auth pages (e.g. /admin/auth/login)
  if (pathname.startsWith('/admin/auth')) {
    return NextResponse.next();
  }

  // 2. Protect all internal admin routes (/admin, /admin/orders, /admin/products, etc.)
  if (!sessionToken) {
    const loginUrl = new URL('/admin/auth/login', request.url);
    loginUrl.searchParams.set('from', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin', '/admin/:path*'],
};
