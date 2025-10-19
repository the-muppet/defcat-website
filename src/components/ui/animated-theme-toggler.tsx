"use client"

import { Moon, Sun } from "lucide-react"
import { cn } from "@/lib/utils"
import { useModeAnimation, ThemeAnimationType } from "@/hooks/useModeAnimation"
import { useManaColor } from "@/lib/contexts/ManaColorContext"

interface AnimatedThemeTogglerProps
  extends React.ComponentPropsWithoutRef<"button"> {
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
  
  const { ref, toggleSwitchTheme, isDarkMode } = useModeAnimation({
    duration,
    animationType,
    blurAmount,
    manaSymbol: selectedMana,
  })

  return (
    <button
      ref={ref}
      onClick={toggleSwitchTheme}
      className={cn(className)}
    >
      {isDarkMode ? <Sun /> : <Moon />}
      <span className="sr-only">Toggle theme</span>
    </button>
  )
}