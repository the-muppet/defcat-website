// components/settings/ManaSymbolIcon.tsx
"use client"

import { useState, useEffect } from 'react'
import { ManaSymbol } from '@/lib/utility/svg-mask'
import { MANA_SVG_MAP, loadManaSVG } from '@/lib/utility/mana-svg-loader'
import { cn } from '@/lib/utils'

interface ManaSymbolIconProps {
  symbol: ManaSymbol
  className?: string
  size?: 'sm' | 'md' | 'lg'
  style?: React.CSSProperties
  fillColor?: string
}

export function ManaSymbolIcon({
  symbol,
  className = "",
  size = 'md',
  style,
  fillColor
}: ManaSymbolIconProps) {
  const [baseSvgContent, setBaseSvgContent] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-10 h-10',
    lg: 'w-full h-full'
  }

  // Load the SVG only once when the symbol changes
  useEffect(() => {
    let cancelled = false

    const loadSVG = async () => {
      try {
        const svgData = MANA_SVG_MAP[symbol]
        const content = await loadManaSVG(svgData.path)

        if (!cancelled) {
          setBaseSvgContent(content)
          setError(false)
          setLoading(false)
        }
      } catch (err) {
        if (!cancelled) {
          console.error(`Error loading SVG for ${symbol}:`, err)
          setError(true)
          setLoading(false)
        }
      }
    }

    loadSVG()

    return () => {
      cancelled = true
    }
  }, [symbol])

  // Apply fill color transformation separately
  const svgContent = fillColor
    ? baseSvgContent
        .replace(/fill="[^"]*"/g, `fill="${fillColor}"`)
        .replace(/fill='[^']*'/g, `fill='${fillColor}'`)
    : baseSvgContent

  if (loading) {
    return (
      <div className={cn(
        "flex items-center justify-center",
        sizeClasses[size],
        className
      )}>
        <div className="w-1/2 h-1/2 border-2 border-current border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (error) {
    return (
      <div className={cn(
        "flex items-center justify-center text-destructive",
        sizeClasses[size],
        className
      )}>
        <span className="text-2xl">⚠</span>
      </div>
    )
  }

  return (
    <div
      className={cn(sizeClasses[size], className, "flex items-center justify-center")}
      style={{
        // Ensure SVG inherits color from parent
        color: 'inherit',
        ...style
      }}
    >
      <div
        className="w-full h-full [&>svg]:w-full [&>svg]:h-full"
        dangerouslySetInnerHTML={{ __html: svgContent }}
      />
    </div>
  )
}