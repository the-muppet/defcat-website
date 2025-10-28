'use client'

import { Flame, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { useRoastEligibility } from '@/lib/hooks/useRoastEligibility'
import { cn } from '@/lib/utils'

interface RoastButtonProps {
  moxfieldUrl: string
  variant?: 'default' | 'compact' | 'icon-only'
  className?: string
}

export function RoastButton({ moxfieldUrl, variant = 'default', className }: RoastButtonProps) {
  const { isEligible, roastCredits, isLoading, error, isPrivileged } = useRoastEligibility()

  const roastUrl = `/decks/roast-submission?deckUrl=${encodeURIComponent(moxfieldUrl)}`

  // Don't show anything while loading or if user is not eligible
  if (isLoading || !isEligible) {
    return null
  }

  const buttonContent = (
    <>
      <Flame className="h-4 w-4" />
      {variant === 'default' && (
        <>
          <span className="ml-2">Roast This Deck</span>
          {!isPrivileged && (
            <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-destructive/20 text-destructive font-semibold">
              {roastCredits} left
            </span>
          )}
        </>
      )}
      {variant === 'compact' && (
        <>
          <span className="ml-2">Roast</span>
          {!isPrivileged && <span className="ml-1 text-xs opacity-70">({roastCredits})</span>}
        </>
      )}
    </>
  )

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            asChild
            variant="destructive"
            size={variant === 'icon-only' ? 'icon' : 'default'}
            className={cn(
              'bg-orange-600 hover:bg-orange-700 text-white transition-all',
              variant === 'icon-only' && 'hover:scale-110',
              className
            )}
          >
            <Link href={roastUrl}>{buttonContent}</Link>
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p className="text-sm">
            {variant === 'icon-only' && 'Roast This Deck - '}
            {isPrivileged
              ? 'Unlimited roasts (Staff)'
              : `${roastCredits} roast credit${roastCredits !== 1 ? 's' : ''} remaining this month`}
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
