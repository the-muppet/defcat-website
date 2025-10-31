import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export function DeckDetailError({ error }: { error: Error }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-destructive/5">
      <div className="text-center max-w-md">
        <div className="bg-destructive/10 rounded-full p-4 inline-block mb-4">
          <div className="text-destructive text-4xl">⚠</div>
        </div>
        <p className="text-destructive text-lg font-semibold mb-2">
          {error?.message || 'Failed to load deck'}
        </p>
        <p className="text-muted-foreground mb-6">
          Something went wrong while loading this deck.
        </p>
        <Button asChild size="lg" className="shadow-lg">
          <Link href="/decks">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Decks
          </Link>
        </Button>
      </div>
    </div>
  )
}