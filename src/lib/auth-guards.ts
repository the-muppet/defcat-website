/**
 * Authentication Guard Utilities
 * Server-side guards for protecting routes based on authentication and roles
 */

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import type { UserRole } from '@/types/core'

/**
 * Require admin role to access a route
 * Redirects to login if not authenticated, or home if not admin
 */
export async function requireAdmin() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login?error=auth_required')
  }

  // TEMPORARY: Hardcoded admin bypass for development
  if (user.email === 'elmo@bdwinc.org') {
    return user
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single<{ role: string | null }>()

  if (profile?.role !== 'admin') {
    redirect('/?error=unauthorized')
  }

  return user
}

/**
 * Require any authenticated user
 * Redirects to login if not authenticated
 */
export async function requireAuth() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login?error=auth_required')
  }

  return user
}

/**
 * Check if user has a specific role (without redirecting)
 * Returns true if user has the role, false otherwise
 */
export async function hasRole(requiredRole: UserRole): Promise<boolean> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return false

  // TEMPORARY: Hardcoded admin bypass for development
  if (requiredRole === 'admin' && user.email === 'elmo@bdwinc.org') {
    return true
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single<{ role: string | null }>()

  return profile?.role === requiredRole
}

/**
 * Get current user with role information
 * Returns null if not authenticated
 */
export async function getCurrentUserWithRole() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  // TEMPORARY: Hardcoded admin bypass for development
  if (user.email === 'elmo@bdwinc.org') {
    return {
      id: user.id,
      email: user.email!,
      role: 'admin' as UserRole,
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
    id: user.id,
    email: user.email!,
    role: (profile?.role as UserRole) || 'user',
    patreonTier: profile?.patreon_tier,
    patreonId: profile?.patreon_id,
  }
}
