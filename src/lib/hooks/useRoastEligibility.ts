// hooks/useRoastEligibility.ts

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

interface RoastEligibilityStatus {
  isEligible: boolean
  tier: string | null
  roastCredits: number
  isLoading: boolean
  error: string | null
  isPrivileged: boolean
}

export function useRoastEligibility(): RoastEligibilityStatus {
  const [status, setStatus] = useState<RoastEligibilityStatus>({
    isEligible: false,
    tier: null,
    roastCredits: 0,
    isLoading: true,
    error: null,
    isPrivileged: false,
  })

  const supabase = createClient()

  useEffect(() => {
    async function checkEligibility() {
      try {
        // Check if user is logged in
        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser()

        if (authError || !user) {
          setStatus({
            isEligible: false,
            tier: null,
            roastCredits: 0,
            isLoading: false,
            error: 'Please sign in to submit a roast request',
            isPrivileged: false,
          })
          return
        }

        // Get user profile to check tier and role
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('patreon_tier, role')
          .eq('id', user.id)
          .single()

        if (profileError || !profile) {
          setStatus({
            isEligible: false,
            tier: null,
            roastCredits: 0,
            isLoading: false,
            error: 'Unable to verify Patreon tier',
            isPrivileged: false,
          })
          return
        }

        const tier = profile.patreon_tier
        const role = profile.role

        // Check if user is privileged (admin, moderator, developer)
        const isPrivileged = ['admin', 'moderator', 'developer'].includes(role)

        // Check if tier is eligible for roasts (Emissary and up)
        const eligibleTiers = ['Emissary', 'Duke', 'Wizard', 'ArchMage']
        const hasTierAccess = eligibleTiers.includes(tier)

        if (!hasTierAccess && !isPrivileged) {
          setStatus({
            isEligible: false,
            tier,
            roastCredits: 0,
            isLoading: false,
            error: `Roast submissions require Emissary tier ($30/month) or higher. Your current tier: ${tier}`,
            isPrivileged: false,
          })
          return
        }

        // If privileged, skip credit check
        if (isPrivileged) {
          setStatus({
            isEligible: true,
            tier,
            roastCredits: 999, // Unlimited
            isLoading: false,
            error: null,
            isPrivileged: true,
          })
          return
        }

        // Check cumulative roast credits using the user_roast_status view
        const { data: roastStatus, error: creditsError } = await supabase
          .from('user_roast_status')
          .select('roast_credits')
          .eq('user_id', user.id)
          .single()

        if (creditsError) {
          console.error('Error checking roast credits:', creditsError)
          setStatus({
            isEligible: false,
            tier,
            roastCredits: 0,
            isLoading: false,
            error: 'Unable to check roast credits',
            isPrivileged: false,
          })
          return
        }

        const roastCredits = roastStatus?.roast_credits ?? 0

        if (roastCredits <= 0) {
          setStatus({
            isEligible: false,
            tier,
            roastCredits: 0,
            isLoading: false,
            error: 'You have no roast credits remaining. Credits are granted monthly based on your Patreon tier.',
            isPrivileged: false,
          })
          return
        }

        setStatus({
          isEligible: true,
          tier,
          roastCredits,
          isLoading: false,
          error: null,
          isPrivileged: false,
        })
      } catch (error) {
        console.error('Error checking roast eligibility:', error)
        setStatus({
          isEligible: false,
          tier: null,
          roastCredits: 0,
          isLoading: false,
          error: 'An error occurred while checking eligibility',
          isPrivileged: false,
        })
      }
    }

    checkEligibility()
  }, [supabase])

  return status
}
