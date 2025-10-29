'use client'

import { Flame, Loader2, Sparkles } from 'lucide-react'
import { TierBadge } from '@/components/tier/TierBadge'
import { Card, CardContent } from '@/components/ui/card'
import { useSubmissionEligibility, useRoastEligibility } from '@/lib/contexts/AuthContext'
import type { PatreonTier } from '@/types/core'

interface TierCreditsCardProps {
  tier: PatreonTier
}

export function TierCreditsCard({ tier }: TierCreditsCardProps) {
  const { remainingSubmissions, isLoading: submissionLoading } = useSubmissionEligibility()
  const { roastCredits, isLoading: roastLoading } = useRoastEligibility()

  return (
    <Card className="glass-panel border-0 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-[var(--mana-color)]/10 via-transparent to-transparent" />
      <CardContent className="relative p-4 space-y-4">
        {/* Tier Badge */}
        <div className="flex justify-center">
          <TierBadge tier={tier} showTooltip={true} />
        </div>

        {/* Credits Display */}
        <div className="grid grid-cols-2 gap-3">
          {/* Submission Credits */}
          <div className="flex flex-col items-center p-3 rounded-lg bg-primary/10 border border-primary/20">
            <Sparkles className="h-5 w-5 mb-2" style={{ color: 'var(--mana-color)' }} />
            <div className="text-2xl font-bold">
              {submissionLoading ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : (
                remainingSubmissions
              )}
            </div>
            <div className="text-xs text-muted-foreground text-center">Deck Credits</div>
          </div>

          {/* Roast Credits */}
          <div className="flex flex-col items-center p-3 rounded-lg bg-orange-500/10 border border-orange-500/20">
            <Flame className="h-5 w-5 mb-2 text-orange-500" />
            <div className="text-2xl font-bold">
              {roastLoading ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : (
                roastCredits
              )}
            </div>
            <div className="text-xs text-muted-foreground text-center">Roast Credits</div>
          </div>
        </div>

        {/* Helper Text */}
        <p className="text-xs text-center text-muted-foreground">
          Credits refresh monthly and accumulate
        </p>
      </CardContent>
    </Card>
  )
}
