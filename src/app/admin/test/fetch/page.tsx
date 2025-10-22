// app/admin/test-fetch/page.tsx
"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"

// Force dynamic rendering to prevent build-time prerender
export const dynamic = 'force-dynamic'

export default function TestFetchPage() {
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const testFetch = async () => {
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const response = await fetch(
        'https://api2.moxfield.com/v1/bookmarks/xpGzQ?decksPageSize=100',
        {
          headers: {
            'accept': 'application/json',
            'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
          }
        }
      )

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      setResult(data)
      
      console.log('✅ Fetch successful!')
      console.log('Total decks:', data.deckCount)
      console.log('First deck:', data.decks.data[0])
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error'
      setError(errorMsg)
      console.error('❌ Fetch failed:', errorMsg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-2xl font-bold mb-4">Test Moxfield Fetch</h1>
      
      <Button onClick={testFetch} disabled={loading}>
        {loading ? 'Fetching...' : 'Test Fetch'}
      </Button>

      {error && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded">
          <h2 className="font-semibold text-red-700">Error:</h2>
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {result && (
        <div className="mt-4 space-y-4">
          <div className="p-4 bg-green-50 border border-green-200 rounded">
            <h2 className="font-semibold text-green-700">✅ Success!</h2>
            <p>Total decks: {result.deckCount}</p>
          </div>

          <div className="p-4 bg-gray-50 border rounded">
            <h3 className="font-semibold mb-2">First 5 Decks:</h3>
            <div className="space-y-2">
              {result.decks.data.slice(0, 5).map((item: any) => (
                <div key={item.deck.publicId} className="text-sm border-b pb-2">
                  <p className="font-medium">{item.deck.name}</p>
                  <p className="text-gray-600">
                    ID: {item.deck.publicId} | Format: {item.deck.format}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <details className="border rounded p-4">
            <summary className="font-semibold cursor-pointer">
              Full JSON Response (click to expand)
            </summary>
            <pre className="mt-2 text-xs overflow-auto bg-gray-100 p-4 rounded">
              {JSON.stringify(result, null, 2)}
            </pre>
          </details>
        </div>
      )}
    </div>
  )
}