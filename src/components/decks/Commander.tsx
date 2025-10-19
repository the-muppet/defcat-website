"use client"

import { useState, useEffect } from 'react'
import { fetchCardArt } from '@/lib/api/scryfall'
import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import Image from 'next/image'

interface CommanderImageProps {
  commanders: string[]  // Array of commanders
  className?: string
  fallbackIcon?: string
}

// Single commander image component
function SingleCommanderImage({ 
  commanderName, 
  className,
  fallbackIcon = '🎴'
}: {
  commanderName: string
  className?: string
  fallbackIcon?: string
}) {
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    let mounted = true

    const loadImage = async () => {
      try {
        setLoading(true)
        setError(false)
        
        const artCrop = await fetchCardArt(commanderName)
        
        if (mounted) {
          if (artCrop) {
            setImageUrl(artCrop)
          } else {
            setError(true)
          }
        }
      } catch (err) {
        console.error('Error loading commander image:', err)
        if (mounted) {
          setError(true)
        }
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    loadImage()

    return () => {
      mounted = false
    }
  }, [commanderName])

  if (loading) {
    return (
      <div className={cn(
        "flex items-center justify-center bg-gradient-to-br from-purple-900/50 to-pink-900/50",
        className
      )}>
        <div className="text-center">
          <Loader2 className="mx-auto mb-2 h-12 w-12 animate-spin text-white/60" />
          <div className="text-sm text-white/60">Loading...</div>
        </div>
      </div>
    )
  }

  if (error || !imageUrl) {
    return (
      <div className={cn(
        "flex items-center justify-center bg-gradient-to-br from-purple-900/50 to-pink-900/50",
        className
      )}>
        <div className="text-center">
          <div className="mb-2 text-6xl">{fallbackIcon}</div>
          <div className="text-sm text-white/60">Commander Art</div>
        </div>
      </div>
    )
  }

  return (
    <div className={cn("relative overflow-hidden", className)}>
      <Image
        src={imageUrl}
        alt={commanderName}
        fill
        className="object-cover"
        sizes="(max-width: 768px) 100vw, 224px"
        priority={false}
        unoptimized
      />
      <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/60 to-transparent" />
    </div>
  )
}

// Main component that handles multiple commanders
export function CommanderImage({ commanders, className, fallbackIcon = '🎴' }: CommanderImageProps) {
  if (!commanders || commanders.length === 0) {
    return (
      <div className={cn(
        "flex items-center justify-center bg-gradient-to-br from-purple-900/50 to-pink-900/50",
        className
      )}>
        <div className="text-center">
          <div className="mb-2 text-6xl">{fallbackIcon}</div>
          <div className="text-sm text-white/60">No Commander</div>
        </div>
      </div>
    )
  }

  if (commanders.length === 1) {
    return (
      <SingleCommanderImage 
        commanderName={commanders[0]}
        className={className}
        fallbackIcon={fallbackIcon}
      />
    )
  }

  return (
    <div className={cn("grid gap-1 h-full", className)}>
      {commanders.length === 2 ? (
        <div className="grid grid-cols-2 gap-1 h-full">
          {commanders.map((commander, idx) => (
            <SingleCommanderImage
              key={`${commander}-${idx}`}
              commanderName={commander}
              className="h-full w-full"
              fallbackIcon={fallbackIcon}
            />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-1 h-full">
          {commanders.slice(0, 4).map((commander, idx) => (
            <SingleCommanderImage
              key={`${commander}-${idx}`}
              commanderName={commander}
              className="h-full w-full"
              fallbackIcon={fallbackIcon}
            />
          ))}
        </div>
      )}
    </div>
  )
}