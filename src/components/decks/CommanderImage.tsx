'use client'

import { Loader2 } from 'lucide-react'
import Image from 'next/image'
import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'

interface CommanderImageProps {
  commanders: string[] // Card IDs from deck_cards table
  className?: string
  fallbackIcon?: string
}

interface SingleCommanderImageProps {
  cardId: string
  className?: string
  fallbackIcon?: string
}

function SingleCommanderImage({
  cardId,
  className,
  fallbackIcon = '🎴',
}: SingleCommanderImageProps) {
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    let mounted = true

    const loadImage = async () => {
      if (!cardId || typeof cardId !== 'string') {
        console.warn('Invalid card ID:', cardId)
        if (mounted) {
          setError(true)
          setLoading(false)
        }
        return
      }

      try {
        setLoading(true)
        setError(false)

        const response = await fetch(`/api/card-image?id=${encodeURIComponent(cardId)}`, {
          headers: {
            Accept: 'application/json',
          },
        })

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`)
        }

        const data = await response.json()

        if (mounted) {
          if (data.imageUrl) {
            setImageUrl(data.imageUrl)
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
  }, [cardId])

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
        alt={`Commander ${cardId}`}
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

export function CommanderImage({
  commanders,
  className,
  fallbackIcon = '🎴',
}: CommanderImageProps) {
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
        cardId={validCommanders[0]}
        className={className}
        fallbackIcon={fallbackIcon}
      />
    )
  }

  return (
    <div className={cn('grid gap-1 h-full', className)}>
      {validCommanders.length === 2 ? (
        <div className="grid grid-cols-2 gap-1 h-full">
          {validCommanders.map((cardId, idx) => (
            <SingleCommanderImage
              key={`${cardId}-${idx}`}
              cardId={cardId}
              className="h-full w-full"
              fallbackIcon={fallbackIcon}
            />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-1 h-full">
          {validCommanders.slice(0, 4).map((cardId, idx) => (
            <SingleCommanderImage
              key={`${cardId}-${idx}`}
              cardId={cardId}
              className="h-full w-full"
              fallbackIcon={fallbackIcon}
            />
          ))}
        </div>
      )}
    </div>
  )
}
