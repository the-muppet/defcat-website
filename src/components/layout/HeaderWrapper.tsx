import { createClient } from '@/lib/supabase/server'
import { Header } from './Header'
import type { PatreonTier } from '@/types/core'

export async function HeaderWrapper() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  let userTier: PatreonTier = 'Citizen'
  let userRole = 'user'
  let pendingCount = 0

  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('patreon_tier, role')
      .eq('id', user.id)
      .single()

    if (profile) {
      userTier = (profile.patreon_tier as PatreonTier) || 'Citizen'
      userRole = profile.role || 'user'

      if (['admin', 'developer'].includes(userRole)) {
        const { count } = await supabase
          .from('deck_submissions')
          .select('*', { count: 'exact', head: true })
          .in('status', ['pending', 'queued'])

        pendingCount = count || 0
      }
    }
  }

  return (
    <Header
      initialUser={user}
      initialUserTier={userTier}
      initialUserRole={userRole}
      initialPendingCount={pendingCount}
    />
  )
}
