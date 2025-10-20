"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Youtube } from "lucide-react"

interface FeaturedVideoProps {
  videoId?: string
  title?: string
}

export function FeaturedVideo({ videoId, title = "Today's Featured Video" }: FeaturedVideoProps) {
  return (
    <section className="py-12 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <Youtube className="h-6 w-6" style={{ color: 'var(--mana-color)' }} />
          <h2 className="text-3xl font-bold">{title}</h2>
        </div>

        <Card className="glass border-white/10 bg-card-tinted overflow-hidden">
          <CardContent className="p-0">
            {videoId ? (
              <div className="aspect-video">
                <iframe
                  width="100%"
                  height="100%"
                  src={`https://www.youtube.com/embed/${videoId}`}
                  title="YouTube video player"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full"
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
