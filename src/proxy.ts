/**
 * Next.js Middleware
 * Runs on Edge Runtime before every request
 * Handles broad authentication and route-level authorization
 */
/** biome-ignore-all assist/source/organizeImports: <explanation> */
/** biome-ignore-all lint/correctness/noUnusedImports: <explanation> */

import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { logger } from '@/lib/observability/logger'
import { type UserRole, ROLE_HIERARCHY } from './types/core'

function generateRequestId(): string {
  return `req-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
}

const PROTECTED_ROUTES: Array<{
  path: string
  minimumRole: UserRole
  exactMatch?: boolean
}> = [
  { path: '/admin', minimumRole: 'moderator' },
  { path: '/dashboard', minimumRole: 'member' },
  { path: '/profile', minimumRole: 'member' },
  { path: '/submit', minimumRole: 'member' },
]

const PUBLIC_ROUTES = [
  '/',
  '/auth/login',
  '/auth/patreon-callback',
  '/auth/signup',
  '/about',
  '/pricing',
  '/decks',
  '/commanders',
  '/api/webhooks',
]

function isProtectedRoute(pathname: string): {
  protected: boolean
  minimumRole?: UserRole
} {
  for (const publicPath of PUBLIC_ROUTES) {
    if (pathname === publicPath || pathname.startsWith(`${publicPath}/`)) {
      return { protected: false }
    }
  }

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

  return { protected: false }
}

function hasMinimumRole(userRole: UserRole, minimumRole: UserRole): boolean {
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[minimumRole]
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const requestId = generateRequestId()

  const routeCheck = isProtectedRoute(pathname)

  if (!routeCheck.protected) {
    const response = NextResponse.next()
    response.headers.set('X-Request-ID', requestId)
    return response
  }

  logger.debug('Processing protected route', { requestId, pathname, minimumRole: routeCheck.minimumRole })

  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? '',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '',
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value)
          })
          response = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options)
          })
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    logger.info('Unauthenticated user redirected to login', { requestId, pathname })
    const loginUrl = new URL('/auth/login', request.url)
    loginUrl.searchParams.set('error', 'auth_required')
    loginUrl.searchParams.set('redirect', pathname)
    const redirectResponse = NextResponse.redirect(loginUrl)
    redirectResponse.headers.set('X-Request-ID', requestId)
    return redirectResponse
  }

  if (routeCheck.minimumRole) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single<{ role: string | null }>()

    const userRole = (profile?.role as UserRole) || 'user'

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

  response.headers.set('X-Request-ID', requestId)
  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}