'use client'
import { useState } from 'react'
import { useDocSearch } from '@/hooks/useDocSearch'
import { Input } from '@/components/ui/input'

export function DocSearch() {
  const [query, setQuery] = useState('')
  const { search, results, loading } = useDocSearch()

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) await search(query)
  }

  return (
    <div>
      <form onSubmit={handleSearch} className="mb-4">
        <Input
          placeholder="Ask about the docs... (e.g., 'How do I add authentication?')"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </form>

      {loading && <div>Searching...</div>}

      <div className="space-y-4">
        {results.map((result) => (
          <div key={result.id} className="border p-4 rounded">
            <div className="text-sm text-muted-foreground mb-1">
              {result.filename} {result.heading && `→ ${result.heading}`}
            </div>
            <div className="prose prose-sm">
              {result.content.substring(0, 300)}...
            </div>
            <div className="text-xs text-muted-foreground mt-2">
              Similarity: {(result.similarity * 100).toFixed(1)}%
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}