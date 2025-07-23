import { NextRequest, NextResponse } from 'next/server';

// User impersonation middleware for development
// Allows testing as any user with ?token=DEV_TOKEN&user=userId
export async function middleware(request: NextRequest) {
  // Only enable impersonation in development mode
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.next();
  }

  const { searchParams } = new URL(request.url);
  const token = searchParams.get('token');
  const userId = searchParams.get('user');

  // Check if this is an impersonation request
  if (!token || !userId) {
    return NextResponse.next();
  }

  // Verify the development token
  const devToken = process.env.DEV_IMPERSONATION_TOKEN;
  if (!devToken || token !== devToken) {
    return NextResponse.next();
  }

  // Create a response and set impersonation cookie
  // Note: User validation happens in the session handler to avoid edge runtime issues
  const response = NextResponse.next();
  response.cookies.set('dev-impersonate-user', userId, {
    httpOnly: true,
    secure: false, // Development only
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24, // 24 hours
  });

  return response;
}

// Configure which routes the middleware runs on
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