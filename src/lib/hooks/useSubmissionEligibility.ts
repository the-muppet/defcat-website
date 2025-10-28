// hooks/useSubmissionEligibility.ts

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

interface SubmissionStatus {
  isEligible: boolean
  tier: string | null
  maxSubmissions: number
  usedSubmissions: number
  remainingSubmissions: number
  isLoading: boolean
  error: string | null
}

export function useSubmissionEligibility(): SubmissionStatus {
  const [status, setStatus] = useState<SubmissionStatus>({
    isEligible: false,
    tier: null,
    maxSubmissions: 0,
    usedSubmissions: 0,
    remainingSubmissions: 0,
    isLoading: true,
    error: null,
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
            maxSubmissions: 0,
            usedSubmissions: 0,
            remainingSubmissions: 0,
            isLoading: false,
            error: 'Please sign in to submit a deck',
          })
          return
        }

        // Get user profile to check tier
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('patreon_tier')
          .eq('id', user.id)
          .single()

        if (profileError || !profile) {
          setStatus({
            isEligible: false,
            tier: null,
            maxSubmissions: 0,
            usedSubmissions: 0,
            remainingSubmissions: 0,
            isLoading: false,
            error: 'Unable to verify Patreon tier',
          })
          return
        }

        // Check if tier is eligible (Duke, Wizard, or ArchMage)
        const eligibleTiers = ['Duke', 'Wizard', 'ArchMage']
        const isEligible = eligibleTiers.includes(profile.patreon_tier)

        if (!isEligible) {
          setStatus({
            isEligible: false,
            tier: profile.patreon_tier,
            maxSubmissions: 0,
            usedSubmissions: 0,
            remainingSubmissions: 0,
            isLoading: false,
            error: `Deck submissions require Duke tier ($50/month) or higher. Your current tier: ${profile.patreon_tier}`,
          })
          return
        }

        // Get submission status for this month
        const { data: submissionStatus, error: statusError } = await supabase
          .from('user_submission_status')
          .select('*')
          .single()

        if (statusError || !submissionStatus) {
          // Fallback if view query fails
          let maxSubs = 1
          if (profile.patreon_tier === 'Wizard') {
            maxSubs = 3
          } else if (profile.patreon_tier === 'ArchMage') {
            maxSubs = 2
          }

          setStatus({
            isEligible: true,
            tier: profile.patreon_tier,
            maxSubmissions: maxSubs,
            usedSubmissions: 0,
            remainingSubmissions: maxSubs,
            isLoading: false,
            error: null,
          })
          return
        }

        setStatus({
          isEligible: submissionStatus.remaining_submissions > 0,
          tier: submissionStatus.patreon_tier,
          maxSubmissions: submissionStatus.max_submissions,
          usedSubmissions: submissionStatus.used_submissions,
          remainingSubmissions: submissionStatus.remaining_submissions,
          isLoading: false,
          error:
            submissionStatus.remaining_submissions === 0
              ? 'You have no deck submission credits remaining. Credits are granted monthly based on your Patreon tier and accumulate over time.'
              : null,
        })
      } catch (error) {
        console.error('Error checking eligibility:', error)
        setStatus((prev) => ({
          ...prev,
          isLoading: false,
          error: 'Failed to check eligibility',
        }))
      }
    }

    checkEligibility()
  }, [supabase])

  return status
}
