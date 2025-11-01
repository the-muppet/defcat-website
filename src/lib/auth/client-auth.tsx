/** biome-ignore-all lint/suspicious/noAssignInExpressions: <explanation> */
/** biome-ignore-all lint/suspicious/noImplicitAnyLet: <explanation> */
'use client'

import { createContext, useContext, type ReactNode } from 'react'
import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'
import type { UserRole, PatreonTier } from '@/types/core'

export interface AuthState {
  user: User | null
  profile: {
    tier: PatreonTier | string
    role: UserRole
  }
  credits: Record<string, number> // Dynamic credits: { roast: 5, deck: 3, review: 2 }
  eligibility: Record<string, boolean> // Dynamic eligibility based on credits
  tierBenefits: Record<string, number> // What this tier should get monthly
  isLoading: boolean
  isAuthenticated: boolean
  isAdmin: boolean
  isModerator: boolean
  isDeveloper: boolean
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
  ArchMage: 5,
}

/**
 * Check if a tier meets the minimum required tier
 */
function hasMinimumTier(userTier: PatreonTier | string, minimumTier: PatreonTier): boolean {
  if (!userTier || !(userTier in TIER_RANKS)) return false
  return TIER_RANKS[userTier as PatreonTier] >= TIER_RANKS[minimumTier]
}

const AuthContext = createContext<AuthState | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const { data, isLoading } = useQuery({
    queryKey: ['auth-session'],
    queryFn: async (): Promise<AuthState> => {
      const supabase = createClient()

      // Get user - suppress OAuth validation errors for custom Patreon OAuth
      let session
      try {
        const { data: sessionData } = await supabase.auth.getSession()
        session = sessionData.session
      } catch (err: any) {
        // Suppress "missing destination name oauth_client_id" errors
        // These occur because we use custom Patreon OAuth, not Supabase native OAuth
        if (err?.code === 'unexpected_failure' && err?.message?.includes('oauth_client_id')) {
          console.warn('Custom OAuth in use, skipping native OAuth validation')
        } else {
          console.error('Error getting session:', err)
        }
      }

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
          isAdmin: false,
          isModerator: false,
          isDeveloper: false,
        }
      }

      // Get profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('patreon_tier, role')
        .eq('id', user.id)
        .single<{
          patreon_tier: string | null
          role: string | null
        }>()

      const tier = profile?.patreon_tier || 'Citizen'
      const role = (profile?.role as UserRole) || 'user'

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
      const credits: Record<string, number> = (userCredits?.credits as Record<string, number>) || {}

      // Build tier benefits map
      const benefits: Record<string, number> = {}
      tierBenefits?.forEach((tb) => {
        if (tb.credit_type_id) {
          benefits[tb.credit_type_id] = tb.amount
        }
      })

      // Build eligibility map (has credits > 0)
      const eligibility: Record<string, boolean> = {}
      Object.keys(credits).forEach((creditType) => {
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
        isAdmin: role === 'admin' || role === 'developer',
        isModerator: role === 'moderator' || role === 'admin' || role === 'developer',
        isDeveloper: role === 'developer',
      }
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes
  })

  const value: AuthState = data || {
    user: null,
    profile: { tier: 'Citizen', role: 'user' },
    credits: {},
    eligibility: {},
    tierBenefits: {},
    isLoading,
    isAuthenticated: false,
    isAdmin: false,
    isModerator: false,
    isDeveloper: false,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

/**
 * Main auth hook - provides complete auth state
 */
export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}

/**
 * Simplified auth hook for components that only need basic user info
 * Backward compatible with old useAuth.ts
 */
export function useAuthUser() {
  const { user, profile, isLoading, isAuthenticated, isAdmin } = useAuth()

  return {
    user: user
      ? {
          id: user.id,
          email: user.email!,
          patreonId: user.user_metadata?.patreon_id || null,
          patreonTier: profile.tier,
          role: profile.role,
        }
      : null,
    tier: profile.tier,
    role: profile.role,
    isLoading,
    isAuthenticated,
    isAdmin,
  }
}

/**
 * Hook for roast eligibility (backward compatible)
 */
export function useRoastEligibility() {
  const { credits, eligibility, isLoading } = useAuth()
  return {
    isEligible: eligibility.roast || false,
    roastCredits: credits.roast || 0,
    isLoading,
  }
}

/**
 * Hook for deck submission eligibility (backward compatible)
 */
export function useSubmissionEligibility() {
  const { credits, eligibility, tierBenefits, isLoading } = useAuth()
  return {
    isEligible: eligibility.deck || false,
    remainingSubmissions: credits.deck || 0,
    maxSubmissions: tierBenefits.deck || 0,
    isLoading,
  }
}

/**
 * Generic hook for any credit type
 * @param creditType - The credit type ID (e.g., 'roast', 'deck', 'review')
 */
export function useCreditType(creditType: string) {
  const { credits, eligibility, tierBenefits } = useAuth()

  return {
    credits: credits[creditType] || 0,
    isEligible: eligibility[creditType] || false,
    monthlyAllowance: tierBenefits[creditType] || 0,
  }
}

/**
 * Hook for role-based access control
 */
export function useRoleAccess() {
  const { profile, isAdmin, isModerator, isDeveloper } = useAuth()

  return {
    role: profile.role,
    isAdmin,
    isModerator,
    isDeveloper,
    isMember: ['member', 'moderator', 'admin', 'developer'].includes(profile.role),
    canModerate: isModerator,
    canAdmin: isAdmin,
  }
}

/**
 * Hook for Patreon tier-based access control
 */
export function useTierAccess() {
  const { profile, isLoading } = useAuth()
  const tier = profile.tier

  return {
    tier,
    tierRank: tier in TIER_RANKS ? TIER_RANKS[tier as PatreonTier] : 0,
    isLoading,
    
    // Tier checks (minimum tier or higher)
    hasCitizen: hasMinimumTier(tier, 'Citizen'),
    hasKnight: hasMinimumTier(tier, 'Knight'),
    hasEmissary: hasMinimumTier(tier, 'Emissary'),
    hasDuke: hasMinimumTier(tier, 'Duke'),
    hasWizard: hasMinimumTier(tier, 'Wizard'),
    hasArchMage: hasMinimumTier(tier, 'ArchMage'),
    
    // Exact tier checks
    isCitizen: tier === 'Citizen',
    isKnight: tier === 'Knight',
    isEmissary: tier === 'Emissary',
    isDuke: tier === 'Duke',
    isWizard: tier === 'Wizard',
    isArchMage: tier === 'ArchMage',
    
    // Patron status
    isPatron: tier in TIER_RANKS,
    
    // Generic tier checker
    hasTier: (minimumTier: PatreonTier) => hasMinimumTier(tier, minimumTier),
    hasExactTier: (exactTier: PatreonTier) => tier === exactTier,
  }
}

/**
 * Combined hook for both role and tier access
 * Useful for features that gate on either/both
 */
export function useAccess() {
  const roleAccess = useRoleAccess()
  const tierAccess = useTierAccess()

  return {
    ...roleAccess,
    ...tierAccess,
  }
}