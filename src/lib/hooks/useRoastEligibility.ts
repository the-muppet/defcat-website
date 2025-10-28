import { useAuth } from '@/lib/contexts/AuthContext'

export function useRoastEligibility() {
  const auth = useAuth()

  return {
    isEligible: auth.roast.isEligible,
    tier: auth.profile.tier,
    roastCredits: auth.roast.credits,
    isLoading: auth.isLoading,
    error: auth.roast.isEligible ? null : 'Not eligible for roasts',
    isPrivileged: auth.roast.isUnlimited,
  }
}
