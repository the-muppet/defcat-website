'use cache'

import { createClient } from '@/lib/supabase/server'
import type { PatreonTier } from '@/types/core'

export async function getCurrentUser() {
  const supabase = await createClient()

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    return null
  }

  return user
}

export async function getUserProfile(userId: string) {
  const supabase = await createClient()

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()

  if (error) {
    console.error('Failed to fetch user profile:', error)
    return null
  }

  return profile
}

export async function getUserWithProfile() {
  const user = await getCurrentUser()

  if (!user) {
    return null
  }

  const profile = await getUserProfile(user.id)

  return {
    ...user,
    profile,
    tier: (profile?.patreon_tier as PatreonTier) || 'Citizen',
    role: profile?.role || 'user',
  }
}
