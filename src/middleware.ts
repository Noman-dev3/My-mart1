
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getAdminSession } from '@/app/admin/login/actions';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // This is the primary guard. If the path is not an admin path, do nothing.
  if (!pathname.startsWith('/admin')) {
    return NextResponse.next();
  }
  
  // Protect all /admin routes except for the login page itself
  if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
    const session = await getAdminSession();
    if (!session) {
      // Not authenticated, redirect to login page
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
  }

  return NextResponse.next();
}

// This matcher is a secondary guard to hint to Next.js which paths to consider.
export const config = {
  matcher: '/admin/:path*',
};
