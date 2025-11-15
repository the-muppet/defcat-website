/**
 * Server-Side Authentication Guards
 * For use in Server Components and Server Actions
 * Redirects to login/home on auth failure
 */

import { redirect } from 'next/navigation'
import { getUserWithRole, hasMinimumRole, hasMinimumTier, type AuthResult } from './core'
import type { UserRole, PatreonTier } from '@/types/core'
import type { User } from '@supabase/supabase-js'

/**
 * Require any authenticated user
 */
export async function requireAuth(): Promise<User> {
  const result = await getUserWithRole()
  if (!result) redirect('/auth/login?error=auth_required')
  return result.user
}

/**
 * Require user with specific minimum role
 */
export async function requireRole(minimumRole: UserRole): Promise<AuthResult> {
  const result = await getUserWithRole()
  if (!result) redirect('/auth/login?error=auth_required')
  if (!hasMinimumRole(result.role, minimumRole)) redirect('/?error=unauthorized')
  return result
}

/**
 * Require user with specific minimum Patreon tier
 */
export async function requireTier(minimumTier: PatreonTier): Promise<AuthResult> {
  const result = await getUserWithRole()
  if (!result) redirect('/auth/login?error=auth_required')
  if (!hasMinimumTier(result.patreonTier, minimumTier)) redirect('/?error=tier_required')
  return result
}

// Role convenience functions
export const requireMember = () => requireRole('member')
export const requireModerator = () => requireRole('moderator')
export const requireAdmin = () => requireRole('admin')
export const requireDeveloper = () => requireRole('developer')

// Tier convenience functions
export const requireCitizen = () => requireTier('Citizen')
export const requireKnight = () => requireTier('Knight')
export const requireEmissary = () => requireTier('Emissary')
export const requireDuke = () => requireTier('Duke')
export const requireWizard = () => requireTier('Wizard')
export const requireArchMage = () => requireTier('ArchMage')

/**
 * Get current user (non-redirecting)
 */
export const getCurrentUser = getUserWithRole

/**
 * Check if current user has minimum role (non-redirecting)
 */
export async function hasRole(minimumRole: UserRole): Promise<boolean> {
  const result = await getUserWithRole()
  if (!result) return false
  return hasMinimumRole(result.role, minimumRole)
}

/**
 * Check if current user has exact role (non-redirecting)
 */
export async function hasExactRole(exactRole: UserRole): Promise<boolean> {
  const result = await getUserWithRole()
  return result?.role === exactRole
}

/**
 * Check if current user has minimum tier (non-redirecting)
 */
export async function hasTier(minimumTier: PatreonTier): Promise<boolean> {
  const result = await getUserWithRole()
  if (!result) return false
  return hasMinimumTier(result.patreonTier, minimumTier)
}

/**
 * Check if current user has exact tier (non-redirecting)
 */
export async function hasExactTier(exactTier: PatreonTier): Promise<boolean> {
  const result = await getUserWithRole()
  return result?.patreonTier === exactTier
}

/**
 * Check if current user is a patron (non-redirecting)
 */
export async function isPatron(): Promise<boolean> {
  const result = await getUserWithRole()
  return result?.patreonTier !== null
}