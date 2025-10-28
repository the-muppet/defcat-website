'use client'

import { Loader2, Play } from 'lucide-react'
import dynamic from 'next/dynamic'

const ReactPlayer = dynamic(() => import('react-player'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-muted/30 flex items-center justify-center">
      <Loader2 className="h-12 w-12 animate-spin text-muted-foreground" />
    </div>
  ),
})

interface VideoPlayerProps {
  url?: string
  videoId?: string
  playing?: boolean
  controls?: boolean
  light?: boolean | string
  muted?: boolean
  loop?: boolean
  volume?: number
  playbackRate?: number
  pip?: boolean
  stopOnUnmount?: boolean
  fallbackIcon?: React.ReactNode
  fallbackText?: string
  onReady?: () => void
  onStart?: () => void
  onPlay?: () => void
  onPause?: () => void
  onEnded?: () => void
  onError?: (error: any) => void
}

export function VideoPlayer({
  url,
  videoId,
  playing = false,
  controls = true,
  light = true,
  muted = false,
  loop = false,
  volume = 0.8,
  playbackRate = 1,
  pip = false,
  stopOnUnmount = true,
  fallbackIcon = <Play className="h-16 w-16" />,
  fallbackText = 'Video player will load here',
  onReady,
  onStart,
  onPlay,
  onPause,
  onEnded,
  onError,
}: VideoPlayerProps) {
  const videoUrl = url || (videoId ? `https://www.youtube.com/watch?v=${videoId}` : null)

  if (!videoUrl) {
    return (
      <div className="w-full h-full bg-muted/30 flex items-center justify-center">
        <div className="text-center">
          {fallbackIcon && <div className="mx-auto mb-4 text-muted-foreground">{fallbackIcon}</div>}
          <p className="text-lg text-muted-foreground">{fallbackText}</p>
        </div>
      </div>
    )
  }

  return (
    <ReactPlayer
      url={videoUrl}
      width="100%"
      height="100%"
      playing={playing}
      controls={controls}
      light={light}
      muted={muted}
      loop={loop}
      volume={volume}
      playbackRate={playbackRate}
      pip={pip}
      stopOnUnmount={stopOnUnmount}
      config={{
        youtube: {},
      }}
      onReady={onReady}
      onStart={onStart}
      onPlay={onPlay}
      onPause={onPause}
      onEnded={onEnded}
      onError={onError}
    />
  )
}
