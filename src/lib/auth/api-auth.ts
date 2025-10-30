/**
 * API Route Authentication Guards
 * Server-side guards specifically for API routes and Route Handlers
 * Returns proper HTTP Response objects instead of redirecting
 */
/** biome-ignore-all assist/source/organizeImports: <explanation> */

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { User } from '@supabase/supabase-js'

export type UserRole = 'user' | 'member' | 'moderator' | 'admin' | 'developer'

export interface AuthResult {
  user: User
  role: UserRole
  patreonTier: string | null
  patreonId: string | null
}

/**
 * Role hierarchy for permission checks
 */
const ROLE_HIERARCHY: Record<UserRole, number> = {
  user: 0,
  member: 1,
  moderator: 2,
  admin: 3,
  developer: 4,
}

/**
 * Internal helper to get user with complete profile info
 */
async function getUserWithRole(): Promise<AuthResult | null> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, patreon_tier, patreon_id')
    .eq('id', user.id)
    .single<{
      role: string | null
      patreon_tier: string | null
      patreon_id: string | null
    }>()

  return {
    user,
    role: (profile?.role as UserRole) || 'user',
    patreonTier: profile?.patreon_tier || null,
    patreonId: profile?.patreon_id || null,
  }
}

/**
 * Check if a role meets the minimum required role
 */
function hasMinimumRole(userRole: UserRole, minimumRole: UserRole): boolean {
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[minimumRole]
}

/**
 * API guard result - either auth data or error response
 */
export type ApiGuardResult<T = AuthResult> =
  | { success: true; data: T }
  | { success: false; response: NextResponse }

/**
 * Require any authenticated user (API version)
 * @returns Either auth result or error response
 */
export async function requireAuthApi(): Promise<ApiGuardResult> {
  const result = await getUserWithRole()

  if (!result) {
    return {
      success: false,
      response: NextResponse.json(
        { error: 'Authentication required', code: 'AUTH_REQUIRED' },
        { status: 401 }
      ),
    }
  }

  return { success: true, data: result }
}

/**
 * Require user with specific minimum role (API version)
 * @param minimumRole - Minimum role required
 * @returns Either auth result or error response
 */
export async function requireRoleApi(minimumRole: UserRole): Promise<ApiGuardResult> {
  const result = await getUserWithRole()

  if (!result) {
    return {
      success: false,
      response: NextResponse.json(
        { error: 'Authentication required', code: 'AUTH_REQUIRED' },
        { status: 401 }
      ),
    }
  }

  if (!hasMinimumRole(result.role, minimumRole)) {
    return {
      success: false,
      response: NextResponse.json(
        {
          error: 'Insufficient permissions',
          code: 'FORBIDDEN',
          required: minimumRole,
          current: result.role,
        },
        { status: 403 }
      ),
    }
  }

  return { success: true, data: result }
}

/**
 * Require member role or higher (API version)
 */
export async function requireMemberApi(): Promise<ApiGuardResult> {
  return requireRoleApi('member')
}

/**
 * Require moderator role or higher (API version)
 */
export async function requireModeratorApi(): Promise<ApiGuardResult> {
  return requireRoleApi('moderator')
}

/**
 * Require admin role or higher (API version)
 */
export async function requireAdminApi(): Promise<ApiGuardResult> {
  return requireRoleApi('admin')
}

/**
 * Require developer role (API version)
 */
export async function requireDeveloperApi(): Promise<ApiGuardResult> {
  return requireRoleApi('developer')
}

/**
 * Get current user with role information (API version, non-throwing)
 * @returns Auth result or null if not authenticated
 */
export async function getCurrentUserApi(): Promise<AuthResult | null> {
  return getUserWithRole()
}

/**
 * Check if current user has a specific minimum role (API version, non-throwing)
 * @param minimumRole - Minimum role to check
 * @returns true if user has role or higher, false otherwise
 */
export async function hasRoleApi(minimumRole: UserRole): Promise<boolean> {
  const result = await getUserWithRole()
  if (!result) return false
  return hasMinimumRole(result.role, minimumRole)
}

/**
 * Check if current user has exact role (API version, non-throwing)
 * @param exactRole - Exact role to check
 * @returns true if user has exact role, false otherwise
 */
export async function hasExactRoleApi(exactRole: UserRole): Promise<boolean> {
  const result = await getUserWithRole()
  return result?.role === exactRole
}

/**
 * Helper to create standard error responses
 */
export const ApiErrors = {
  unauthorized: (message = 'Authentication required') =>
    NextResponse.json({ error: message, code: 'AUTH_REQUIRED' }, { status: 401 }),

  forbidden: (message = 'Insufficient permissions') =>
    NextResponse.json({ error: message, code: 'FORBIDDEN' }, { status: 403 }),

  notFound: (message = 'Resource not found') =>
    NextResponse.json({ error: message, code: 'NOT_FOUND' }, { status: 404 }),

  badRequest: (message = 'Invalid request', details?: any) =>
    NextResponse.json({ error: message, code: 'BAD_REQUEST', details }, { status: 400 }),

  serverError: (message = 'Internal server error') =>
    NextResponse.json({ error: message, code: 'SERVER_ERROR' }, { status: 500 }),

  methodNotAllowed: (allowed: string[] = []) =>
    NextResponse.json(
      { error: 'Method not allowed', code: 'METHOD_NOT_ALLOWED', allowed },
      { status: 405, headers: { Allow: allowed.join(', ') } }
    ),
}