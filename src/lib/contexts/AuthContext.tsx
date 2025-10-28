'use client'

import { createContext, useContext, type ReactNode } from 'react'
import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'
import type { PatreonTier } from '@/types/core'

interface AuthState {
  user: User | null
  profile: {
    tier: PatreonTier
    role: 'user' | 'admin' | 'moderator' | 'developer'
  }
  roast: {
    isEligible: boolean
    credits: number
    isUnlimited: boolean
  }
  submission: {
    isEligible: boolean
    remaining: number
    max: number
  }
  isLoading: boolean
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthState | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const { data, isLoading } = useQuery({
    queryKey: ['auth-session'],
    queryFn: async (): Promise<AuthState> => {
      const supabase = createClient()

      const {
        data: { session },
      } = await supabase.auth.getSession()

      const user = session?.user ?? null

      if (!user) {
        return {
          user: null,
          profile: { tier: 'Citizen', role: 'user' },
          roast: { isEligible: false, credits: 0, isUnlimited: false },
          submission: { isEligible: false, remaining: 0, max: 0 },
          isLoading: false,
          isAuthenticated: false,
        }
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('patreon_tier, role')
        .eq('id', user.id)
        .single()

      const tier = (profile?.patreon_tier as PatreonTier) || 'Citizen'
      const role = (profile?.role as 'user' | 'admin' | 'moderator' | 'developer') || 'user'
      const isPrivileged = ['admin', 'moderator', 'developer'].includes(role)

      const roastEligibleTiers = ['Emissary', 'Duke', 'Wizard', 'ArchMage']
      const hasRoastTier = roastEligibleTiers.includes(tier)

      let roastCredits = 0
      if (hasRoastTier || isPrivileged) {
        if (isPrivileged) {
          roastCredits = 999
        } else {
          const { data: roastStatus } = await supabase
            .from('user_roast_status')
            .select('roast_credits')
            .eq('user_id', user.id)
            .single()
          roastCredits = roastStatus?.roast_credits ?? 0
        }
      }

      const submissionEligibleTiers = ['Duke', 'Wizard', 'ArchMage']
      const hasSubmissionTier = submissionEligibleTiers.includes(tier)

      let submissionRemaining = 0
      let submissionMax = 0
      if (hasSubmissionTier || isPrivileged) {
        const { data: submissionStatus } = await supabase
          .from('user_submission_status')
          .select('*')
          .single()

        if (submissionStatus) {
          submissionRemaining = submissionStatus.remaining_submissions
          submissionMax = submissionStatus.max_submissions
        } else {
          if (tier === 'Wizard') submissionMax = 3
          else if (tier === 'ArchMage') submissionMax = 2
          else submissionMax = 1
          submissionRemaining = submissionMax
        }
      }

      return {
        user,
        profile: { tier, role },
        roast: {
          isEligible: (hasRoastTier || isPrivileged) && roastCredits > 0,
          credits: roastCredits,
          isUnlimited: isPrivileged,
        },
        submission: {
          isEligible: (hasSubmissionTier || isPrivileged) && submissionRemaining > 0,
          remaining: submissionRemaining,
          max: submissionMax,
        },
        isLoading: false,
        isAuthenticated: true,
      }
    },
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
  })

  const value: AuthState = data || {
    user: null,
    profile: { tier: 'Citizen', role: 'user' },
    roast: { isEligible: false, credits: 0, isUnlimited: false },
    submission: { isEligible: false, remaining: 0, max: 0 },
    isLoading,
    isAuthenticated: false,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
