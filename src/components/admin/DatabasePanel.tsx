'use client'

import { AlertCircle, CheckCircle2, Database, Play, Table, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { createClient } from '@/lib/supabase/client'

export function DatabasePanel() {
  const [query, setQuery] = useState('')
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  const quickTables = [
    { name: 'Products', table: 'products' },
    { name: 'Site Config', table: 'site_config' },
    { name: 'Profiles', table: 'profiles' },
    { name: 'Decks', table: 'decks' },
    { name: 'Deck Submissions', table: 'deck_submissions' },
    { name: 'Cards', table: 'cards' },
  ]

  const handleExecuteQuery = async () => {
    if (!query.trim()) {
      setError('Please enter a query')
      return
    }

    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      if (!session) {
        throw new Error('Not authenticated')
      }

      const response = await fetch('/api/admin/database/query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ query }),
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Query failed')
      }

      setResult(data)
    } catch (err) {
      console.error('Query error:', err)
      setError(err instanceof Error ? err.message : 'Failed to execute query')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Column - Quick Queries */}
        <Card className="glass-panel lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Table className="h-4 w-4" />
              Quick Queries
            </CardTitle>
            <CardDescription className="text-xs">Click to load query</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {quickTables.map((t) => (
              <Button
                key={t.name}
                onClick={() => setQuery(`SELECT * FROM ${t.table};`)}
                variant="outline"
                className="w-full justify-start font-mono text-sm"
              >
                <Table className="h-4 w-4 mr-2" />
                {t.name}
              </Button>
            ))}
          </CardContent>
        </Card>

        {/* Right Column - SQL Editor */}
        <Card className="glass-panel lg:col-span-3">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-4 w-4" />
              Query Editor
            </CardTitle>
            <CardDescription>Execute SQL queries directly on the database</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Query</label>
              <Textarea
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="SELECT * FROM products;"
                className="font-mono text-sm min-h-[200px]"
              />
            </div>

            <div className="flex gap-2">
              <Button
                onClick={handleExecuteQuery}
                disabled={loading || !query.trim()}
                className="btn-tinted-primary"
              >
                <Play className="h-4 w-4 mr-2" />
                {loading ? 'Executing...' : 'Execute Query'}
              </Button>
              <Button
                onClick={() => {
                  setQuery('')
                  setResult(null)
                  setError(null)
                }}
                variant="outline"
                disabled={loading}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Clear
              </Button>
            </div>

            {error && (
              <div className="p-4 bg-destructive/10 border border-destructive rounded-lg flex items-start gap-2">
                <AlertCircle className="h-5 w-5 text-destructive mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-destructive">Error</p>
                  <p className="text-sm text-destructive/80 mt-1 font-mono">{error}</p>
                </div>
              </div>
            )}

            {result && (
              <div className="p-4 bg-green-500/10 border border-green-500 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  <p className="text-sm font-medium text-green-500">Query executed successfully</p>
                </div>
                {result.rowCount !== undefined && (
                  <p className="text-xs text-muted-foreground mb-2">
                    Rows returned: {result.rowCount}
                  </p>
                )}
                <div className="overflow-x-auto">
                  <pre className="text-xs bg-background/50 p-4 rounded border">
                    {JSON.stringify(result.data, null, 2)}
                  </pre>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="glass-panel border-yellow-500/20 bg-yellow-500/5">
        <CardHeader>
          <CardTitle className="text-yellow-500 flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            Warning
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="text-sm text-muted-foreground">
            This panel provides direct database access. Use with caution:
          </p>
          <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground ml-2">
            <li>All queries are executed with service role privileges</li>
            <li>Destructive operations (DELETE, DROP, etc.) are permanent</li>
            <li>Always test queries in development first</li>
            <li>Consider backing up data before making changes</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
