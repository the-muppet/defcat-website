'use client'
// biome-ignore assist/source/organizeImports: <explanation>
import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import { ManaSymbol, ManaColor } from '@/types/colors'

interface ManaColorContextType {
  selectedMana: ManaSymbol
  setSelectedMana: (color: ManaSymbol) => void
}

const ManaColorContext = createContext<ManaColorContextType | undefined>(undefined)

export function ManaColorProvider({ children }: { children: ReactNode }) {
  const [selectedMana, setSelectedManaState] = useState<ManaSymbol>(ManaSymbol.GREEN)

  useEffect(() => {
    const saved = localStorage.getItem('mana-color')
    if (saved && Object.values(ManaSymbol).includes(saved as ManaSymbol)) {
      setSelectedManaState(saved as ManaSymbol)
      applyManaColor(saved as ManaSymbol)
    } else {
      applyManaColor(ManaSymbol.COLORLESS)
    }
  }, [])

  const setSelectedMana = (color: ManaSymbol) => {
    setSelectedManaState(color)
    localStorage.setItem('mana-color', color)
    applyManaColor(color)
  }

  return (
    <ManaColorContext.Provider value={{ selectedMana, setSelectedMana }}>
      {children}
    </ManaColorContext.Provider>
  )
}

export function useManaColor() {
  const context = useContext(ManaColorContext)
  if (context === undefined) {
    throw new Error('useManaColor must be used within a ManaColorProvider')
  }
  return context
}

// Apply mana color to CSS variables with consistent colorization
function applyManaColor(mana: ManaSymbol) {
  const colors: Record<ManaSymbol, string> = {
    [ManaSymbol.WHITE]: ManaColor.WHITE,
    [ManaSymbol.BLUE]: ManaColor.BLUE,
    [ManaSymbol.BLACK]: ManaColor.BLACK,
    [ManaSymbol.RED]: ManaColor.RED,
    [ManaSymbol.GREEN]: ManaColor.GREEN,
    [ManaSymbol.COLORLESS]: ManaColor.COLORLESS,
  }

  const root = document.documentElement

  // Set the transition only once
  if (!root.style.transition) {
    root.style.transition = 'background-color 400ms ease-out, color 400ms ease-out'
  }

  // Update the color
  root.style.setProperty('--mana-color', colors[mana])

  // Set data attribute for CSS targeting
  root.setAttribute('data-mana', mana)
}
