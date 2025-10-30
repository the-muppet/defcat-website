/**
 * Server-Side Authentication Guards
 * Consolidated server guards for protecting routes based on authentication and roles
 */

import { redirect } from 'next/navigation'
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
 * Higher roles inherit permissions from lower roles
 */
const ROLE_HIERARCHY: Record<UserRole, number> = {
  user: 0,
  member: 1,
  moderator: 2,
  admin: 3,
  developer: 4, // Highest level
}

/**
 * TEMPORARY: Hardcoded admin bypass for development
 */
const ADMIN_BYPASS_EMAILS = ['elmo@bdwinc.org']

/**
 * Internal helper to get user with complete profile info
 */
async function getUserWithRole(): Promise<AuthResult | null> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  // TEMPORARY: Hardcoded admin bypass for development
  if (ADMIN_BYPASS_EMAILS.includes(user.email || '')) {
    return {
      user,
      role: 'admin',
      patreonTier: null,
      patreonId: null,
    }
  }

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
 * Uses role hierarchy - higher roles automatically satisfy lower role requirements
 */
function hasMinimumRole(userRole: UserRole, minimumRole: UserRole): boolean {
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[minimumRole]
}

/**
 * Require any authenticated user
 * @returns User object
 */
export async function requireAuth(): Promise<User> {
  const result = await getUserWithRole()
  if (!result) {
    redirect('/auth/login?error=auth_required')
  }
  return result.user
}

/**
 * Require user with specific minimum role
 * Uses role hierarchy - admin can access moderator routes, etc.
 * @param minimumRole - Minimum role required
 * @returns Complete auth result with user and role
 */
export async function requireRole(minimumRole: UserRole): Promise<AuthResult> {
  const result = await getUserWithRole()
  
  if (!result) {
    redirect('/auth/login?error=auth_required')
  }

  if (!hasMinimumRole(result.role, minimumRole)) {
    redirect('/?error=unauthorized')
  }

  return result
}

/**
 * Require member role or higher
 * Allows: member, moderator, admin, developer
 */
export async function requireMember(): Promise<AuthResult> {
  return requireRole('member')
}

/**
 * Require moderator role or higher
 * Allows: moderator, admin, developer
 */
export async function requireModerator(): Promise<AuthResult> {
  return requireRole('moderator')
}

/**
 * Require admin role or higher
 * Allows: admin, developer
 */
export async function requireAdmin(): Promise<AuthResult> {
  return requireRole('admin')
}

/**
 * Require developer role (highest level)
 * Only allows: developer
 */
export async function requireDeveloper(): Promise<AuthResult> {
  return requireRole('developer')
}

/**
 * Get current user with role information (non-redirecting)
 * @returns Auth result or null if not authenticated
 */
export async function getCurrentUser(): Promise<AuthResult | null> {
  return getUserWithRole()
}

/**
 * Check if current user has a specific minimum role (non-redirecting)
 * @param minimumRole - Minimum role to check
 * @returns true if user has role or higher, false otherwise
 */
export async function hasRole(minimumRole: UserRole): Promise<boolean> {
  const result = await getUserWithRole()
  if (!result) return false
  return hasMinimumRole(result.role, minimumRole)
}

/**
 * Check if current user has exact role (non-redirecting)
 * Does not use hierarchy - only returns true for exact match
 * @param exactRole - Exact role to check
 * @returns true if user has exact role, false otherwise
 */
export async function hasExactRole(exactRole: UserRole): Promise<boolean> {
  const result = await getUserWithRole()
  return result?.role === exactRole
}