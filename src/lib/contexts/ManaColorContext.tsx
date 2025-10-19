// lib/contexts/ManaColorContext.tsx
"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { ManaSymbol } from '@/lib/utility/svg-mask'

interface ManaColorContextType {
  selectedMana: ManaSymbol
  setSelectedMana: (color: ManaSymbol) => void
}

const ManaColorContext = createContext<ManaColorContextType | undefined>(undefined)

export function ManaColorProvider({ children }: { children: ReactNode }) {
  const [selectedMana, setSelectedManaState] = useState<ManaSymbol>(ManaSymbol.RED)

  useEffect(() => {
    const saved = localStorage.getItem('mana-color')
    if (saved && Object.values(ManaSymbol).includes(saved as ManaSymbol)) {
      setSelectedManaState(saved as ManaSymbol)
      applyManaColor(saved as ManaSymbol)
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
  // Use OKLCH for consistent color space
  const colors = {
    [ManaSymbol.RED]: 'oklch(0.30 0.40 50)',
    [ManaSymbol.BLUE]: 'oklch(0.30 0.40 250)',    
    [ManaSymbol.GREEN]: 'oklch(0.30 0.35 150)',  
    [ManaSymbol.WHITE]: 'oklch(0.95 0.20 115)',
    [ManaSymbol.BLACK]: 'oklch(0.20 0.35 335)',
  }

  const root = document.documentElement

  // Set the transition only once
  if (!root.style.transition) {
    root.style.transition = 'background-color 400ms ease-out, color 400ms ease-out'
  }

  // Update the color
  root.style.setProperty('--mana-color', colors[mana])
}