/**
 * Core authentication logic
 * Shared between server and API guards
 */

import { createClient } from '@/lib/supabase/server'
import type { User } from '@supabase/supabase-js'
import { ROLE_HIERARCHY, TIER_RANKS } from '@/types/core'
import type { UserRole, PatreonTier } from '@/types/core'

export interface AuthResult {
  user: User
  role: UserRole
  patreonTier: PatreonTier | null
  patreonId: string | null
}

/**
 * Get authenticated user with role and tier information
 */
export async function getUserWithRole(): Promise<AuthResult | null> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
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
 * Uses role hierarchy - higher roles automatically satisfy lower requirements
 */
export function hasMinimumRole(userRole: UserRole, minimumRole: UserRole): boolean {
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[minimumRole]
}

/**
 * Check if a Patreon tier meets the minimum required tier
 * Uses tier hierarchy - higher tiers automatically satisfy lower requirements
 */
export function hasMinimumTier(userTier: PatreonTier | null, minimumTier: PatreonTier): boolean {
  if (!userTier) return false
  return TIER_RANKS[userTier] >= TIER_RANKS[minimumTier]
}