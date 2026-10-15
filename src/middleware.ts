import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Language subpath cleanup: Redirect any /id or /id/* to root or standard path
  if (pathname === '/id' || pathname.startsWith('/id/')) {
    const targetPath = pathname === '/id' ? '/' : pathname.replace(/^\/id/, '');
    const cleanUrl = new URL(targetPath || '/', request.url);
    cleanUrl.search = request.nextUrl.search;
    return NextResponse.redirect(cleanUrl, 301);
  }

  // 2. Canonical redirect for legacy correction-policy to corrections-policy
  if (pathname === '/correction-policy') {
    return NextResponse.redirect(new URL('/corrections-policy', request.url), 301);
  }

  // 3. Protect all /admin routes except /admin/login (with or without trailing slash)
  if (pathname.startsWith('/admin') && !pathname.startsWith('/admin/login')) {
    const sessionCookie =
      request.cookies.get('nusalensa_session')?.value ||
      request.cookies.get('updateyuk_session')?.value;

    if (!sessionCookie) {
      const loginUrl = new URL('/admin/login', request.url);
      loginUrl.searchParams.set('from', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // If already logged in and visiting /admin/login, redirect to /admin
  if (pathname.startsWith('/admin/login')) {
    const sessionCookie =
      request.cookies.get('nusalensa_session')?.value ||
      request.cookies.get('updateyuk_session')?.value;

    if (sessionCookie) {
      return NextResponse.redirect(new URL('/admin', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/id', '/id/:path*', '/correction-policy'],
};
