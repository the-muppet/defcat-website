/**
 * Next.js Middleware
 * Runs on Edge Runtime before every request
 * Handles broad authentication and route-level authorization
 * 
 * Use this for: Route group protection, redirects
 * Use server guards for: Fine-grained role checks, complex logic
 */
/** biome-ignore-all lint/style/noNonNullAssertion: <explanation> */

import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { logger } from '@/lib/observability/logger'

type UserRole = 'user' | 'member' | 'moderator' | 'admin' | 'developer'

/**
 * Generate a unique request ID for tracing
 */
function generateRequestId(): string {
  return `req-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
}

/**
 * Role hierarchy levels
 */
const ROLE_HIERARCHY: Record<UserRole, number> = {
  user: 0,
  member: 1,
  moderator: 2,
  admin: 3,
  developer: 4,
}

/**
 * TEMPORARY: Hardcoded admin bypass for development
 */
const ADMIN_BYPASS_EMAILS = ['elmo@bdwinc.org']

/**
 * Route protection configuration
 * Paths are matched as prefixes (e.g., /admin matches /admin/*)
 */
const PROTECTED_ROUTES: Array<{
  path: string
  minimumRole: UserRole
  exactMatch?: boolean
}> = [
  // Developer-only routes
  { path: '/developer', minimumRole: 'developer' },
  { path: '/dev', minimumRole: 'developer' },
  
  // Admin routes
  { path: '/admin', minimumRole: 'admin' },
  
  // Moderator routes (moderator + admin + developer can access)
  { path: '/mod', minimumRole: 'moderator' },
  
  // Member routes (all authenticated members)
  { path: '/member', minimumRole: 'member' },
  
  // General authenticated routes (any authenticated user)
  { path: '/dashboard', minimumRole: 'user' },
  { path: '/profile', minimumRole: 'user' },
  { path: '/settings', minimumRole: 'user' },
  { path: '/submit', minimumRole: 'user' },
]

/**
 * Public routes that never require authentication
 */
const PUBLIC_ROUTES = [
  '/',
  '/auth/login',
  '/auth/callback',
  '/auth/signup',
  '/about',
  '/pricing',
  '/decks',
  '/commanders', // Public commander info
  '/api/webhooks', // Webhook endpoints
]

/**
 * Check if user role meets minimum required role
 */
function hasMinimumRole(userRole: UserRole, minimumRole: UserRole): boolean {
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[minimumRole]
}

/**
 * Check if path requires authentication
 */
function isProtectedRoute(pathname: string): {
  protected: boolean
  minimumRole?: UserRole
} {
  // Check if it's a public route
  for (const publicPath of PUBLIC_ROUTES) {
    if (pathname === publicPath || pathname.startsWith(`${publicPath}/`)) {
      return { protected: false }
    }
  }

  // Check if it matches a protected route
  for (const route of PROTECTED_ROUTES) {
    if (route.exactMatch) {
      if (pathname === route.path) {
        return { protected: true, minimumRole: route.minimumRole }
      }
    } else {
      if (pathname === route.path || pathname.startsWith(`${route.path}/`)) {
        return { protected: true, minimumRole: route.minimumRole }
      }
    }
  }

  // Default: not protected (allow through)
  return { protected: false }
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Generate request ID for tracking
  const requestId = generateRequestId()

  // Check if route needs protection
  const routeCheck = isProtectedRoute(pathname)

  if (!routeCheck.protected) {
    const response = NextResponse.next()
    response.headers.set('X-Request-ID', requestId)
    return response
  }

  logger.debug('Processing protected route', { requestId, pathname, minimumRole: routeCheck.minimumRole })

  // Create Supabase client for Edge Runtime
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value)
          })
          response = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options)
          })
        },
      },
    }
  )

  // Get user session
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Redirect to login if not authenticated
  if (!user) {
    logger.info('Unauthenticated user redirected to login', { requestId, pathname })
    const loginUrl = new URL('/auth/login', request.url)
    loginUrl.searchParams.set('error', 'auth_required')
    loginUrl.searchParams.set('redirect', pathname)
    const redirectResponse = NextResponse.redirect(loginUrl)
    redirectResponse.headers.set('X-Request-ID', requestId)
    return redirectResponse
  }

  // If route requires specific role, check it
  if (routeCheck.minimumRole) {
    let userRole: UserRole = 'user'

    // TEMPORARY: Hardcoded admin bypass for development
    if (ADMIN_BYPASS_EMAILS.includes(user.email || '')) {
      userRole = 'admin'
    } else {
      // Get user role from profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single<{ role: string | null }>()

      userRole = (profile?.role as UserRole) || 'user'
    }

    // Check if user has minimum required role
    if (!hasMinimumRole(userRole, routeCheck.minimumRole)) {
      logger.warn('User lacks required role for route', {
        requestId,
        pathname,
        userRole,
        requiredRole: routeCheck.minimumRole,
        userId: user.id
      })
      const homeUrl = new URL('/', request.url)
      homeUrl.searchParams.set('error', 'unauthorized')
      const redirectResponse = NextResponse.redirect(homeUrl)
      redirectResponse.headers.set('X-Request-ID', requestId)
      return redirectResponse
    }

    logger.debug('User authorized for protected route', { requestId, pathname, userRole, userId: user.id })
  }

  // Add request ID to response headers
  response.headers.set('X-Request-ID', requestId)
  return response
}

/**
 * Matcher configuration
 * Specifies which routes this middleware runs on
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico (favicon file)
     * - public files (images, etc.)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}