/**
 * Server-Side Authentication Guards
 * Consolidated server guards for protecting routes based on authentication and roles
 */

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import type { User } from '@supabase/supabase-js'
import type { UserRole, PatreonTier } from '@/types/core'

export interface AuthResult {
  user: User
  role: UserRole
  patreonTier: PatreonTier | null
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
 * Patreon tier hierarchy for access control
 * Higher tiers inherit access from lower tiers
 */
export const TIER_RANKS: Record<PatreonTier, number> = {
  Citizen: 0,
  Knight: 1,
  Emissary: 2,
  Duke: 3,
  Wizard: 4,
  ArchMage: 5, // Highest tier
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
    patreonTier: (profile?.patreon_tier as PatreonTier) ?? null,
    patreonId: profile?.patreon_id ?? null,
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
 * Check if a Patreon tier meets the minimum required tier
 * Uses tier hierarchy - higher tiers automatically satisfy lower tier requirements
 */
function hasMinimumTier(userTier: PatreonTier | null, minimumTier: PatreonTier): boolean {
  if (!userTier) return false
  return TIER_RANKS[userTier] >= TIER_RANKS[minimumTier]
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
 * Require user with specific minimum Patreon tier
 * Uses tier hierarchy - ArchMage can access Knight routes, etc.
 * @param minimumTier - Minimum Patreon tier required
 * @returns Complete auth result with user and tier
 */
export async function requireTier(minimumTier: PatreonTier): Promise<AuthResult> {
  const result = await getUserWithRole()
  
  if (!result) {
    redirect('/auth/login?error=auth_required')
  }

  if (!hasMinimumTier(result.patreonTier, minimumTier)) {
    redirect('/?error=tier_required')
  }

  return result
}

/**
 * Require member role or higher
 * Allows: member, moderator, admin, developer
 */
export async function requireMemberAccess(): Promise<AuthResult> {
  return requireRole('member')
}

/**
 * Require moderator role or higher
 * Allows: moderator, admin, developer
 */
export async function requireModeratorAccess(): Promise<AuthResult> {
  return requireRole('moderator')
}

/**
 * Require admin role or higher
 * Allows: admin, developer
 */
export async function requireAdminAccess(): Promise<AuthResult> {
  return requireRole('admin')
}

/**
 * Require developer role (highest level)
 * Only allows: developer
 */
export async function requireDeveloperAccess(): Promise<AuthResult> {
  return requireRole('developer')
}

/**
 * Require Citizen tier or higher (any patron)
 * Allows: Citizen, Knight, Emissary, Duke, Wizard, ArchMage
 */
export async function requireCitizenAccess(): Promise<AuthResult> {
  return requireTier('Citizen')
}

/**
 * Require Knight tier or higher
 * Allows: Knight, Emissary, Duke, Wizard, ArchMage
 */
export async function requireKnightAccess(): Promise<AuthResult> {
  return requireTier('Knight')
}

/**
 * Require Emissary tier or higher
 * Allows: Emissary, Duke, Wizard, ArchMage
 */
export async function requireEmissaryAccess(): Promise<AuthResult> {
  return requireTier('Emissary')
}

/**
 * Require Duke tier or higher
 * Allows: Duke, Wizard, ArchMage
 */
export async function requireDukeAccess(): Promise<AuthResult> {
  return requireTier('Duke')
}

/**
 * Require Wizard tier or higher
 * Allows: Wizard, ArchMage
 */
export async function requireWizardAccess(): Promise<AuthResult> {
  return requireTier('Wizard')
}

/**
 * Require ArchMage tier (highest tier)
 * Only allows: ArchMage
 */
export async function requireArchMageAccess(): Promise<AuthResult> {
  return requireTier('ArchMage')
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

/**
 * Check if current user has a specific minimum Patreon tier (non-redirecting)
 * @param minimumTier - Minimum tier to check
 * @returns true if user has tier or higher, false otherwise
 */
export async function hasTier(minimumTier: PatreonTier): Promise<boolean> {
  const result = await getUserWithRole()
  if (!result) return false
  return hasMinimumTier(result.patreonTier, minimumTier)
}

/**
 * Check if current user has exact Patreon tier (non-redirecting)
 * Does not use hierarchy - only returns true for exact match
 * @param exactTier - Exact tier to check
 * @returns true if user has exact tier, false otherwise
 */
export async function hasExactTier(exactTier: PatreonTier): Promise<boolean> {
  const result = await getUserWithRole()
  return result?.patreonTier === exactTier
}

/**
 * Check if current user is a patron (has any tier) (non-redirecting)
 * @returns true if user has any Patreon tier, false otherwise
 */
export async function isPatron(): Promise<boolean> {
  const result = await getUserWithRole()
  return result?.patreonTier !== null
}