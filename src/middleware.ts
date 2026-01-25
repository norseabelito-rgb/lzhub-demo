import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

/**
 * Middleware placeholder for future cookie-based authentication
 *
 * Currently, auth is handled client-side with localStorage.
 * When migrating to real auth (e.g., NextAuth, Supabase), this middleware
 * will handle server-side route protection using HTTP-only cookies.
 *
 * Future implementation will:
 * - Read session cookie
 * - Validate with auth provider
 * - Redirect unauthenticated users to /login
 * - Protect API routes
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function middleware(_request: NextRequest) {
  // Placeholder - currently passes through all requests
  // Auth protection is handled client-side via AuthGuard component
  return NextResponse.next()
}

export const config = {
  // Routes to apply middleware to
  // Currently matches nothing, will be expanded with real auth
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    // '/((?!_next/static|_next/image|favicon.ico|.*\\..*|api).*)',
  ],
}
