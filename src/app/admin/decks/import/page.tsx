// app/admin/moxfield-sync/page.tsx
'use client'

import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useMoxfieldSync } from '@/hooks/use-moxfield-sync'

export default function MoxfieldSyncPage() {
  const { sync, isLoading, error, data } = useMoxfieldSync()

  const bookmarkId = 'xpGzQ' // or get from env/config

  return (
    <div className="container mx-auto p-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">Moxfield Sync</h1>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Quick Sync - Metadata Only */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Sync</CardTitle>
          </CardHeader>
          <CardContent>
            <Button
              onClick={() => sync({ bookmarkId, fetchCards: false })}
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Fetch Deck Metadata Only
            </Button>
          </CardContent>
        </Card>

        {/* Test Sync */}
        <Card>
          <CardHeader>
            <CardTitle>Test Sync</CardTitle>
          </CardHeader>
          <CardContent>
            <Button
              onClick={() => sync({ bookmarkId, fetchCards: true, maxDecks: 5 })}
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Fetch 5 Decks with Cards
            </Button>
          </CardContent>
        </Card>

        {/* Incremental Syncs */}
        <Card>
          <CardHeader>
            <CardTitle>Incremental Sync</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button
              onClick={() => sync({ bookmarkId, fetchCards: true, maxDecks: 25 })}
              disabled={isLoading}
              variant="outline"
              className="w-full"
            >
              25 Decks
            </Button>
            <Button
              onClick={() => sync({ bookmarkId, fetchCards: true, maxDecks: 50 })}
              disabled={isLoading}
              variant="outline"
              className="w-full"
            >
              50 Decks
            </Button>
            <Button
              onClick={() => sync({ bookmarkId, fetchCards: true, maxDecks: 100 })}
              disabled={isLoading}
              variant="outline"
              className="w-full"
            >
              100 Decks
            </Button>
          </CardContent>
        </Card>

        {/* Full Sync */}
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="text-orange-700">Full Sync</CardTitle>
          </CardHeader>
          <CardContent>
            <Button
              onClick={() => sync({ bookmarkId, fetchCards: true })}
              disabled={isLoading}
              variant="destructive"
              className="w-full"
            >
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Fetch All Decks + Cards (May Timeout!)
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded">
          <p className="text-red-600">Error: {error}</p>
        </div>
      )}

      {/* Success Display */}
      {data && (
        <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded">
          <p className="font-semibold text-green-700 mb-2">{data.message}</p>
          <div className="text-sm text-gray-600 space-y-1">
            <p>Total Decks: {data.totalDecks}</p>
            <p>Inserted: {data.insertedCount}</p>
            {data.cardsFetched !== undefined && (
              <>
                <p>Cards Fetched: {data.cardsFetched}</p>
                <p>Decks Processed: {data.decksFetchedCount}</p>
              </>
            )}
            <p>Duration: {Math.round((data.durationMs || 0) / 1000)}s</p>
          </div>
        </div>
      )}
    </div>
  )
}
