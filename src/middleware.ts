import { NextRequest, NextResponse } from 'next/server';
import { securityMiddleware } from './lib/security/middleware';

export async function middleware(request: NextRequest) {
  // Appliquer le middleware de sécurité
  const securityResponse = await securityMiddleware(request);

  if (securityResponse.status !== 200) {
    return securityResponse;
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public (public files)
     */
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
};
