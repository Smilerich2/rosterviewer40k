import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const COOKIE = 'tv_auth';
const TOKEN  = 'tv-authenticated-2024';

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Pass through: Next.js internals, login page, API, webhook
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/login') ||
    pathname.startsWith('/api/login') ||
    pathname.startsWith('/webhook') ||
    pathname === '/favicon.ico'
  ) {
    return NextResponse.next();
  }

  if (request.cookies.get(COOKIE)?.value !== TOKEN) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image).*)'],
};
