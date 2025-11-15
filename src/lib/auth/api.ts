/**
 * API Route Authentication Guards
 * For use in Route Handlers and API routes
 * Returns NextResponse on auth failure instead of redirecting
 */

import { NextResponse } from 'next/server'
import { getUserWithRole, hasMinimumRole, hasMinimumTier, type AuthResult } from './core'
import type { UserRole, PatreonTier } from '@/types/core'

export type ApiGuardResult<T = AuthResult> = 
  | { ok: true; data: T } 
  | { ok: false; response: NextResponse }

/**
 * Require any authenticated user (API version)
 */
export async function requireAuth(): Promise<ApiGuardResult> {
  const result = await getUserWithRole()
  
  if (!result) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: 'Authentication required', code: 'AUTH_REQUIRED' },
        { status: 401 }
      ),
    }
  }
  
  return { ok: true, data: result }
}

/**
 * Require user with specific minimum role (API version)
 */
export async function requireRole(minimumRole: UserRole): Promise<ApiGuardResult> {
  const result = await getUserWithRole()
  
  if (!result) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: 'Authentication required', code: 'AUTH_REQUIRED' },
        { status: 401 }
      ),
    }
  }
  
  if (!hasMinimumRole(result.role, minimumRole)) {
    return {
      ok: false,
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
  
  return { ok: true, data: result }
}

/**
 * Require user with specific minimum Patreon tier (API version)
 */
export async function requireTier(minimumTier: PatreonTier): Promise<ApiGuardResult> {
  const result = await getUserWithRole()
  
  if (!result) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: 'Authentication required', code: 'AUTH_REQUIRED' },
        { status: 401 }
      ),
    }
  }
  
  if (!hasMinimumTier(result.patreonTier, minimumTier)) {
    return {
      ok: false,
      response: NextResponse.json(
        {
          error: 'Patreon tier required',
          code: 'TIER_REQUIRED',
          required: minimumTier,
          current: result.patreonTier,
        },
        { status: 403 }
      ),
    }
  }
  
  return { ok: true, data: result }
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
 * Get current user
 */
export const getCurrentUser = getUserWithRole

/**
 * Check if current user has minimum role
 */
export async function hasRole(minimumRole: UserRole): Promise<boolean> {
  const result = await getUserWithRole()
  if (!result) return false
  return hasMinimumRole(result.role, minimumRole)
}

/**
 * Check if current user has exact role
 */
export async function hasExactRole(exactRole: UserRole): Promise<boolean> {
  const result = await getUserWithRole()
  return result?.role === exactRole
}

/**
 * Check if current user has minimum tier
 */
export async function hasTier(minimumTier: PatreonTier): Promise<boolean> {
  const result = await getUserWithRole()
  if (!result) return false
  return hasMinimumTier(result.patreonTier, minimumTier)
}

/**
 * Check if current user has exact tier
 */
export async function hasExactTier(exactTier: PatreonTier): Promise<boolean> {
  const result = await getUserWithRole()
  return result?.patreonTier === exactTier
}

/**
 * Check if current user is a patron
 */
export async function isPatron(): Promise<boolean> {
  const result = await getUserWithRole()
  return result?.patreonTier !== null
}

/**
 * Standard API error responses
 */
export const ApiErrors = {
  unauthorized: (message = 'Authentication required') =>
    NextResponse.json({ error: message, code: 'AUTH_REQUIRED' }, { status: 401 }),

  forbidden: (message = 'Insufficient permissions') =>
    NextResponse.json({ error: message, code: 'FORBIDDEN' }, { status: 403 }),

  tierRequired: (tier: PatreonTier, current: PatreonTier | null = null) =>
    NextResponse.json(
      { error: 'Patreon tier required', code: 'TIER_REQUIRED', required: tier, current },
      { status: 403 }
    ),

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