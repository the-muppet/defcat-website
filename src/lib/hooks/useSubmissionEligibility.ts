import { useAuth } from '@/lib/contexts/AuthContext'

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
  const auth = useAuth()

  return {
    isEligible: auth.submission.isEligible,
    tier: auth.profile.tier,
    maxSubmissions: auth.submission.max,
    usedSubmissions: auth.submission.max - auth.submission.remaining,
    remainingSubmissions: auth.submission.remaining,
    isLoading: auth.isLoading,
    error: auth.submission.isEligible
      ? null
      : 'Not eligible for deck submissions or no credits remaining',
  }
}
