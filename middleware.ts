import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { AUTH_COOKIE_NAME, verifyAuthToken } from '@/lib/auth';

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const requiresAdmin = path.startsWith('/admin');
  const requiresInfluencer = path.startsWith('/influencer');
  const storeRestricted =
    path === '/' || path.startsWith('/products') || path.startsWith('/checkout');
  const adminPreviewAllowed = request.nextUrl.searchParams.get('preview') === 'true';

  if (!requiresAdmin && !requiresInfluencer && !storeRestricted) {
    return NextResponse.next();
  }

  const token =
    request.cookies.get(AUTH_COOKIE_NAME)?.value ||
    request.headers.get('Authorization')?.replace('Bearer ', '') ||
    null;
  const payload = token ? await verifyAuthToken(token) : null;

  if ((requiresAdmin || requiresInfluencer) && !payload) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  if (requiresAdmin && (!payload || payload.role !== 'ADMIN')) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  if (requiresInfluencer && (!payload || payload.role !== 'INFLUENCER')) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  if (storeRestricted && payload?.role === 'ADMIN' && !adminPreviewAllowed) {
    return NextResponse.redirect(new URL('/admin', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/influencer/:path*', '/', '/products/:path*', '/checkout'],
};

