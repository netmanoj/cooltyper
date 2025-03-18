import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  try {
    // Create a response object that we can modify
    const res = NextResponse.next();
    
    // Create the Supabase client
    const supabase = createMiddlewareClient({ req: request, res });
    
    console.log('Checking auth for path:', request.nextUrl.pathname);
    
    // Get the session
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('Session check error:', error);
      // On session error, redirect to auth
      return NextResponse.redirect(new URL('/auth', request.url));
    }

    // Log session status
    if (session?.user) {
      console.log('Authenticated user:', session.user.email);
    } else {
      console.log('No authenticated user');
    }

    // Protected routes
    if (request.nextUrl.pathname.startsWith('/profile')) {
      if (!session) {
        console.log('Unauthorized access to profile, redirecting to auth');
        return NextResponse.redirect(new URL('/auth', request.url));
      }
      console.log('Authorized access to profile');
      return res;
    }

    // Auth page handling
    if (request.nextUrl.pathname === '/auth') {
      if (session) {
        console.log('Authenticated user accessing auth page, redirecting to home');
        return NextResponse.redirect(new URL('/', request.url));
      }
      return res;
    }

    // Set the session cookie
    const response = NextResponse.next();
    response.cookies.set('supabase-auth-token', JSON.stringify(session));
    
    return response;

  } catch (error) {
    console.error('Middleware error:', error);
    // On error, redirect to auth
    return NextResponse.redirect(new URL('/auth', request.url));
  }
}

// Update the matcher to include all relevant routes
export const config = {
  matcher: [
    '/profile/:path*',
    '/auth',
    '/api/:path*'
  ]
}; 