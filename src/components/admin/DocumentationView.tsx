'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { BookOpen, Loader2 } from 'lucide-react'

export function DocumentationView() {
  const [content, setContent] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchGuide() {
      try {
        const response = await fetch('/docs/ADMIN_GUIDE.md')
        if (!response.ok) {
          throw new Error('Failed to load admin guide')
        }
        const text = await response.text()
        setContent(text)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load documentation')
      } finally {
        setLoading(false)
      }
    }
    fetchGuide()
  }, [])

  if (loading) {
    return (
      <Card className="card-tinted border-tinted">
        <CardContent className="flex items-center justify-center p-12">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Loading admin guide...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="card-tinted border-tinted border-destructive/50">
        <CardHeader>
          <CardTitle className="text-destructive">Error Loading Documentation</CardTitle>
          <CardDescription>{error}</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card className="card-tinted border-tinted">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Admin Panel User Guide
          </CardTitle>
          <CardDescription>
            Complete guide for managing DefCat DeckVault
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div
            className="prose prose-sm dark:prose-invert max-w-none
              prose-headings:text-foreground prose-headings:font-semibold
              prose-h1:text-3xl prose-h1:mb-6 prose-h1:border-b prose-h1:border-border prose-h1:pb-3
              prose-h2:text-2xl prose-h2:mt-8 prose-h2:mb-4
              prose-h3:text-xl prose-h3:mt-6 prose-h3:mb-3
              prose-p:text-muted-foreground prose-p:leading-7
              prose-a:text-primary prose-a:no-underline hover:prose-a:underline
              prose-strong:text-foreground prose-strong:font-semibold
              prose-ul:text-muted-foreground prose-ul:my-3
              prose-ol:text-muted-foreground prose-ol:my-3
              prose-li:my-1
              prose-code:text-primary prose-code:bg-muted prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:text-sm prose-code:before:content-none prose-code:after:content-none
              prose-pre:bg-muted prose-pre:border prose-pre:border-border
              prose-blockquote:border-l-primary prose-blockquote:text-muted-foreground
              prose-table:text-sm prose-th:text-foreground prose-td:text-muted-foreground"
          >
            <pre className="whitespace-pre-wrap font-sans">{content}</pre>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
