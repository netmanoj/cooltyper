import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req: request, res });

  // Refresh session if it exists
  await supabase.auth.getSession();

  // Get the current pathname
  const pathname = request.nextUrl.pathname;

  // Get the current session
  const {
    data: { session },
  } = await supabase.auth.getSession();

  // Auth routes protection
  if (pathname.startsWith('/profile')) {
    if (!session) {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = '/auth';
      redirectUrl.searchParams.set('redirectedFrom', pathname);
      return NextResponse.redirect(redirectUrl);
    }
  }

  // Redirect from auth page if already logged in
  if (pathname.startsWith('/auth')) {
    if (session) {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = '/profile';
      return NextResponse.redirect(redirectUrl);
    }
  }

  return res;
}

export const config = {
  matcher: [
    '/profile',
    '/auth',
    '/profile/:path*',
    '/auth/:path*'
  ]
};