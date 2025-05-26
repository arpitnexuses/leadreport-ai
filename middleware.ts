import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verify } from 'jsonwebtoken';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  const isAuthPage = request.nextUrl.pathname.startsWith('/login') || 
                     request.nextUrl.pathname.startsWith('/signup');
  const isPublicPage = request.nextUrl.pathname.startsWith('/shared-report');
  
  // Skip middleware for public shared report pages
  if (isPublicPage) {
    return NextResponse.next();
  }

  // If trying to access auth pages while logged in, redirect to home
  if (isAuthPage && token) {
    try {
      verify(token, process.env.JWT_SECRET || 'your-secret-key');
      return NextResponse.redirect(new URL('/', request.url));
    } catch (error) {
      // Invalid token, clear it
      const response = NextResponse.redirect(new URL('/login', request.url));
      response.cookies.delete('token');
      return response;
    }
  }

  // If trying to access protected pages while not logged in, redirect to login
  if (!isAuthPage && !token) {
    return NextResponse.redirect(new URL('/login', request.url));
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
     * - shared-report (public report pages)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|shared-report).*)',
  ],
}; 