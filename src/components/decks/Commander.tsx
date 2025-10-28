'use client'

import { Loader2 } from 'lucide-react'
import Image from 'next/image'
import { useEffect, useState } from 'react'
import { fetchCardArt } from '@/lib/api/scryfall'
import { cn } from '@/lib/utils'

interface CommanderImageProps {
  commanders: string[] // Array of commanders
  className?: string
  fallbackIcon?: string
}

// Single commander image component
function SingleCommanderImage({
  commanderName,
  className,
  fallbackIcon = '🎴',
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
      // Validate commander name before attempting to load
      if (!commanderName || typeof commanderName !== 'string') {
        console.warn('Invalid commander name:', commanderName)
        if (mounted) {
          setError(true)
          setLoading(false)
        }
        return
      }

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
      <div
        className={cn(
          'flex items-center justify-center bg-gradient-to-br from-purple-900/50 to-pink-900/50',
          className
        )}
      >
        <div className="text-center">
          <Loader2 className="mx-auto mb-2 h-12 w-12 animate-spin text-white/60" />
          <div className="text-sm text-white/60">Loading...</div>
        </div>
      </div>
    )
  }

  if (error || !imageUrl) {
    return (
      <div
        className={cn(
          'flex items-center justify-center bg-gradient-to-br from-purple-900/50 to-pink-900/50',
          className
        )}
      >
        <div className="text-center">
          <div className="mb-2 text-6xl">{fallbackIcon}</div>
          <div className="text-sm text-white/60">Commander Art</div>
        </div>
      </div>
    )
  }

  return (
    <div className={cn('relative overflow-hidden', className)}>
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
export function CommanderImage({
  commanders,
  className,
  fallbackIcon = '🎴',
}: CommanderImageProps) {
  // Filter out null/undefined/empty values from commanders array
  const validCommanders = commanders?.filter((c) => c && c.trim() !== '') || []

  if (validCommanders.length === 0) {
    return (
      <div
        className={cn(
          'flex items-center justify-center bg-gradient-to-br from-purple-900/50 to-pink-900/50',
          className
        )}
      >
        <div className="text-center">
          <div className="mb-2 text-6xl">{fallbackIcon}</div>
          <div className="text-sm text-white/60">No Commander</div>
        </div>
      </div>
    )
  }

  if (validCommanders.length === 1) {
    return (
      <SingleCommanderImage
        commanderName={validCommanders[0]}
        className={className}
        fallbackIcon={fallbackIcon}
      />
    )
  }

  return (
    <div className={cn('grid gap-1 h-full', className)}>
      {validCommanders.length === 2 ? (
        <div className="grid grid-cols-2 gap-1 h-full">
          {validCommanders.map((commander, idx) => (
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
          {validCommanders.slice(0, 4).map((commander, idx) => (
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
