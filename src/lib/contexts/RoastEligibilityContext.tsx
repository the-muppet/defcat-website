'use client'

import { createContext, useContext, type ReactNode } from 'react'
import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'

interface RoastEligibilityStatus {
  isEligible: boolean
  tier: string | null
  roastCredits: number
  isLoading: boolean
  error: string | null
  isPrivileged: boolean
}

const RoastEligibilityContext = createContext<RoastEligibilityStatus | undefined>(undefined)

export function RoastEligibilityProvider({ children }: { children: ReactNode }) {
  const { data: status, isLoading } = useQuery({
    queryKey: ['roast-eligibility'],
    queryFn: async (): Promise<RoastEligibilityStatus> => {
      const supabase = createClient()

      try {
        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser()

        if (authError || !user) {
          return {
            isEligible: false,
            tier: null,
            roastCredits: 0,
            isLoading: false,
            error: 'Please sign in to submit a roast request',
            isPrivileged: false,
          }
        }

        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('patreon_tier, role')
          .eq('id', user.id)
          .single()

        if (profileError || !profile) {
          return {
            isEligible: false,
            tier: null,
            roastCredits: 0,
            isLoading: false,
            error: 'Unable to verify Patreon tier',
            isPrivileged: false,
          }
        }

        const tier = profile.patreon_tier
        const role = profile.role

        const isPrivileged = ['admin', 'moderator', 'developer'].includes(role)
        const eligibleTiers = ['Emissary', 'Duke', 'Wizard', 'ArchMage']
        const hasTierAccess = eligibleTiers.includes(tier)

        if (!hasTierAccess && !isPrivileged) {
          return {
            isEligible: false,
            tier,
            roastCredits: 0,
            isLoading: false,
            error: `Roast submissions require Emissary tier ($30/month) or higher. Your current tier: ${tier}`,
            isPrivileged: false,
          }
        }

        if (isPrivileged) {
          return {
            isEligible: true,
            tier,
            roastCredits: 999,
            isLoading: false,
            error: null,
            isPrivileged: true,
          }
        }

        const { data: roastStatus, error: creditsError } = await supabase
          .from('user_roast_status')
          .select('roast_credits')
          .eq('user_id', user.id)
          .single()

        if (creditsError) {
          return {
            isEligible: false,
            tier,
            roastCredits: 0,
            isLoading: false,
            error: 'Unable to check roast credits',
            isPrivileged: false,
          }
        }

        const roastCredits = roastStatus?.roast_credits ?? 0

        if (roastCredits <= 0) {
          return {
            isEligible: false,
            tier,
            roastCredits: 0,
            isLoading: false,
            error: 'You have no roast credits remaining. Credits are granted monthly based on your Patreon tier.',
            isPrivileged: false,
          }
        }

        return {
          isEligible: true,
          tier,
          roastCredits,
          isLoading: false,
          error: null,
          isPrivileged: false,
        }
      } catch (error) {
        return {
          isEligible: false,
          tier: null,
          roastCredits: 0,
          isLoading: false,
          error: 'An error occurred while checking eligibility',
          isPrivileged: false,
        }
      }
    },
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
  })

  const value: RoastEligibilityStatus = status || {
    isEligible: false,
    tier: null,
    roastCredits: 0,
    isLoading,
    error: null,
    isPrivileged: false,
  }

  return <RoastEligibilityContext.Provider value={value}>{children}</RoastEligibilityContext.Provider>
}

export function useRoastEligibility(): RoastEligibilityStatus {
  const context = useContext(RoastEligibilityContext)
  if (context === undefined) {
    throw new Error('useRoastEligibility must be used within RoastEligibilityProvider')
  }
  return context
}
