/** biome-ignore-all lint/a11y/useButtonType: <explanation> */
'use client'

import { useState, useEffect } from 'react'
import { Moon, Sun } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useModeAnimation, ThemeAnimationType } from '@/hooks/useModeAnimation'
import { useManaColor } from '@/lib/contexts/ManaColorContext'

interface AnimatedThemeTogglerProps extends React.ComponentPropsWithoutRef<'button'> {
  duration?: number
  animationType?: ThemeAnimationType
  blurAmount?: number
}

export const AnimatedThemeToggler = ({
  className,
  duration = 750,
  animationType = ThemeAnimationType.MANA,
  blurAmount = 0,
}: AnimatedThemeTogglerProps) => {
  const { selectedMana } = useManaColor()
  const [mounted, setMounted] = useState(false)

  const { ref, toggleSwitchTheme, isDarkMode } = useModeAnimation({
    duration,
    animationType,
    blurAmount,
    manaSymbol: selectedMana
  })

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <button className={cn(className)} aria-label="Toggle theme">
        <div className="w-6 h-6" />
        <span className="sr-only">Toggle theme</span>
      </button>
    )
  }

  return (
    <button ref={ref} onClick={toggleSwitchTheme} className={cn(className)}>
      {isDarkMode ? <Sun /> : <Moon />}
      <span className="sr-only">Toggle theme</span>
    </button>
  )
}
