import OpenAI from 'openai'
import { useState } from 'react'
import { createClient } from '../supabase/server'

interface SearchResult {
  id: string
  filename: string
  heading?: string
  content: string
  similarity: number
}

const openai = new OpenAI({ 
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true 
})

const supabase = createClient()

export function useDocSearch() {
  const [, setResults] = useState([])
  const [, setLoading] = useState(false)

  async function search(query: string) {
    setLoading(true)
    try {
      const embedding = await openai.embeddings.create({
        model: 'text-embedding-3-small',
        input: query
      })

      const { data, error } = await (await supabase).rpc('search_docs', {
        query_embedding: embedding.data[0].embedding,
        match_threshold: 0.75,
        match_count: 10
      })

      setResults(data || [])
    } finally {
      setLoading(false)
    }
  }

  return { search, results: [] as SearchResult[], loading: false }
}