'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface Ad {
  id: string
  title: string
  description: string
  link: string
  imageUrl?: string
}

const advertisements: Ad[] = [
  {
    id: '1',
    title: 'Commander College',
    description: 'Learn to build decks that play exactly how you want',
    link: '/commander-college',
  },
  {
    id: '2',
    title: 'Discount Store',
    description: 'Exclusive deals on MTG accessories and gaming gear',
    link: '/discount-store',
  },
  {
    id: '3',
    title: 'Mana Pool',
    description: 'Coming soon - Track your MTG collection and trades',
    link: '#',
  },
]

export function RotatingAds() {
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % advertisements.length)
    }, 5000) // Rotate every 5 seconds

    return () => clearInterval(interval)
  }, [])

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + advertisements.length) % advertisements.length)
  }

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % advertisements.length)
  }

  const currentAd = advertisements[currentIndex]

  return (
    <section className="py-12 px-6">
      <div className="max-w-7xl mx-auto">
        <Card className="glass border-white/10 bg-card-tinted overflow-hidden relative">
          <CardContent className="p-8">
            <div className="flex items-center justify-between">
              <Button variant="ghost" size="icon" onClick={goToPrevious} className="hover-tinted">
                <ChevronLeft className="h-6 w-6" />
              </Button>

              <a
                href={currentAd.link}
                className="flex-1 text-center hover-tinted rounded-lg p-6 transition-all"
              >
                <h3 className="text-2xl font-bold mb-2 gradient-tinted-text">{currentAd.title}</h3>
                <p className="text-muted-foreground">{currentAd.description}</p>
              </a>

              <Button variant="ghost" size="icon" onClick={goToNext} className="hover-tinted">
                <ChevronRight className="h-6 w-6" />
              </Button>
            </div>

            {/* Progress indicators */}
            <div className="flex gap-2 justify-center mt-6">
              {advertisements.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={cn(
                    'h-2 rounded-full transition-all',
                    index === currentIndex
                      ? 'w-8 bg-tinted'
                      : 'w-2 bg-muted-foreground/30 hover:bg-muted-foreground/50'
                  )}
                  aria-label={`Go to ad ${index + 1}`}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  )
}
