'use client'

import { createContext, useContext, type ReactNode } from 'react'
import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'
import type { PatreonTier } from '@/types/core'

interface AuthState {
  user: User | null
  profile: {
    tier: PatreonTier | string // Now accepts any tier from DB
    role: 'user' | 'admin' | 'moderator' | 'developer'
  }
  credits: Record<string, number> // Dynamic credits: { roast: 5, deck: 3, review: 2 }
  eligibility: Record<string, boolean> // Dynamic eligibility based on credits
  tierBenefits: Record<string, number> // What this tier should get monthly
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
          credits: {},
          eligibility: {},
          tierBenefits: {},
          isLoading: false,
          isAuthenticated: false,
        }
      }

      // Get profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('patreon_tier, role')
        .eq('id', user.id)
        .single()

      const tier = profile?.patreon_tier || 'Citizen'
      const role = (profile?.role as 'user' | 'admin' | 'moderator' | 'developer') || 'user'

      // Get user's current credits (dynamic)
      const { data: userCredits } = await supabase
        .from('user_credits')
        .select('credits')
        .eq('user_id', user.id)
        .maybeSingle()

      // Get tier benefits configuration
      const { data: tierBenefits } = await supabase
        .from('tier_benefits')
        .select(`
          credit_type_id,
          amount,
          credit_types (
            id,
            display_name
          )
        `)
        .eq('tier_id', tier.toLowerCase())

      // Build credits object
      let credits: Record<string, number> = userCredits?.credits || {}

      // Build tier benefits map
      const benefits: Record<string, number> = {}
      tierBenefits?.forEach(tb => {
        if (tb.credit_type_id) {
          benefits[tb.credit_type_id] = tb.amount
        }
      })

      // Build eligibility map (has credits > 0)
      const eligibility: Record<string, boolean> = {}
      Object.keys(credits).forEach(creditType => {
        eligibility[creditType] = credits[creditType] > 0
      })

      return {
        user,
        profile: { tier, role },
        credits,
        eligibility,
        tierBenefits: benefits,
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
    credits: {},
    eligibility: {},
    tierBenefits: {},
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

// Helper hooks for backward compatibility
export function useRoastEligibility() {
  const { credits, eligibility, isLoading } = useAuth()
  return {
    isEligible: eligibility.roast || false,
    roastCredits: credits.roast || 0,
    isLoading,
  }
}

export function useSubmissionEligibility() {
  const { credits, eligibility, tierBenefits, isLoading } = useAuth()
  return {
    isEligible: eligibility.deck || false,
    remainingSubmissions: credits.deck || 0,
    maxSubmissions: tierBenefits.deck || 0,
    isLoading,
  }
}

// Generic hook for any credit type
export function useCreditType(creditType: string) {
  const { credits, eligibility, tierBenefits, profile } = useAuth()
  
  return {
    credits: credits[creditType] || 0,
    isEligible: eligibility[creditType] || false,
    monthlyAllowance: tierBenefits[creditType] || 0
  }
}