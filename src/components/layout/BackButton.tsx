'use client'

import { ArrowLeft } from 'lucide-react'
import { useNavigationHistory } from '@/lib/hooks/useNavigationHistory'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface BackButtonProps {
  fallbackUrl?: string
  label?: string
  variant?: 'default' | 'outline' | 'ghost' | 'link'
  size?: 'default' | 'sm' | 'lg' | 'icon'
  className?: string
  iconOnly?: boolean
}

export function BackButton({
  fallbackUrl = '/decks',
  label = 'Back',
  variant = 'outline',
  size = 'sm',
  className,
  iconOnly = false,
}: BackButtonProps) {
  const { goBack } = useNavigationHistory()

  return (
    <Button
      variant={variant}
      size={size}
      onClick={() => goBack(fallbackUrl)}
      className={cn(className)}
    >
      <ArrowLeft className={cn('h-4 w-4', !iconOnly && 'mr-2')} />
      {!iconOnly && label}
    </Button>
  )
}

interface MobileBackButtonProps {
  fallbackUrl?: string
  className?: string
}

export function MobileBackButton({ fallbackUrl = '/decks', className }: MobileBackButtonProps) {
  const { goBack } = useNavigationHistory()

  return (
    <button
      onClick={() => goBack(fallbackUrl)}
      className={cn(
        'p-2 rounded-full glass-tinted-strong hover:bg-black/60 transition-smooth active:scale-98 touch-target elevation-2',
        className
      )}
    >
      <ArrowLeft className="h-5 w-5 text-white" />
    </button>
  )
}
