"use client"

import dynamic from 'next/dynamic'
import { Card, CardContent } from "@/components/ui/card"
import { Youtube, Loader2 } from "lucide-react"

const ReactPlayer = dynamic(() => import('react-player'), {
  ssr: false,
  loading: () => (
    <div className="aspect-video bg-muted/30 flex items-center justify-center">
      <Loader2 className="h-12 w-12 animate-spin text-muted-foreground" />
    </div>
  )
})

interface FeaturedVideoProps {
  videoId?: string
  url?: string
  title?: string
  playing?: boolean
  controls?: boolean
  light?: boolean
  muted?: boolean
}

export function FeaturedVideo({
  videoId,
  url,
  title = "Today's Featured Video",
  playing = false,
  controls = true,
  light = true,
  muted = false
}: FeaturedVideoProps) {
  const videoUrl = url || (videoId ? `https://www.youtube.com/watch?v=${videoId}` : null)

  return (
    <section className="py-12 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <Youtube className="h-6 w-6" style={{ color: 'var(--mana-color)' }} />
          <h2 className="text-3xl font-bold">{title}</h2>
        </div>

        <Card className="glass border-white/10 bg-card-tinted overflow-hidden">
          <CardContent className="p-0">
            {videoUrl ? (
              <div className="aspect-video relative">
                <ReactPlayer
                  url={videoUrl}
                  width="100%"
                  height="100%"
                  playing={playing}
                  controls={controls}
                  light={light}
                  muted={muted}
                  config={{
                    youtube: {
                      playerVars: {
                        modestbranding: 1,
                        rel: 0
                      }
                    }
                  }}
                  className="absolute top-0 left-0"
                />
              </div>
            ) : (
              <div className="aspect-video bg-muted/30 flex items-center justify-center">
                <div className="text-center">
                  <Youtube className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-lg text-muted-foreground">Featured Video Coming Soon</p>
                  <p className="text-sm text-muted-foreground/70 mt-2">
                    Your YouTube video will appear here
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </section>
  )
}
