'use client'

import { AlertCircle, CheckCircle2, Code, RefreshCw } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { createClient } from '@/lib/supabase/client'
import { PATREON_TIERS } from '@/types/core'

export function DeveloperTools() {
  const [spoofedTier, setSpoofedTier] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{
    type: 'success' | 'error'
    text: string
  } | null>(null)
  const supabase = createClient()

  const handleSpoofTier = async () => {
    if (!spoofedTier) {
      setMessage({ type: 'error', text: 'Please select a tier' })
      return
    }

    setLoading(true)
    setMessage(null)

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      if (!session) {
        throw new Error('Not authenticated')
      }

      const response = await fetch('/api/admin/developer/spoof-tier', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ tier: spoofedTier }),
      })

      const result = await response.json()

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to spoof tier')
      }

      setMessage({
        type: 'success',
        text: `Tier spoofed to ${spoofedTier}. Refresh the page to see changes.`,
      })
    } catch (err) {
      console.error('Failed to spoof tier:', err)
      setMessage({
        type: 'error',
        text: err instanceof Error ? err.message : 'Failed to spoof tier',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleResetTier = async () => {
    setLoading(true)
    setMessage(null)

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      if (!session) {
        throw new Error('Not authenticated')
      }

      const response = await fetch('/api/admin/developer/reset-tier', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      })

      const result = await response.json()

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to reset tier')
      }

      setMessage({
        type: 'success',
        text: 'Tier reset to actual Patreon tier. Refresh the page to see changes.',
      })
      setSpoofedTier('')
    } catch (err) {
      console.error('Failed to reset tier:', err)
      setMessage({
        type: 'error',
        text: err instanceof Error ? err.message : 'Failed to reset tier',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="glass-panel border-purple-500/20 bg-purple-500/5">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Code className="h-5 w-5 text-purple-500" />
          Developer Tools
          <span className="text-xs px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-400">
            Developer Only
          </span>
        </CardTitle>
        <CardDescription>Testing utilities for spoofing Patreon tier levels</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Spoof Patreon Tier</label>
          <Select value={spoofedTier} onValueChange={setSpoofedTier}>
            <SelectTrigger>
              <SelectValue placeholder="Select tier to spoof" />
            </SelectTrigger>
            <SelectContent>
              {PATREON_TIERS.map((tier) => (
                <SelectItem key={tier} value={tier}>
                  {tier}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex gap-2">
          <Button
            onClick={handleSpoofTier}
            disabled={loading || !spoofedTier}
            className="flex-1 bg-purple-600 hover:bg-purple-700 text-white"
          >
            {loading ? 'Updating...' : 'Spoof Tier'}
          </Button>
          <Button
            onClick={handleResetTier}
            disabled={loading}
            variant="outline"
            className="border-purple-500 text-purple-500 hover:bg-purple-500/10"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Reset
          </Button>
        </div>

        {message && (
          <div
            className={`p-3 rounded-lg flex items-start gap-2 ${
              message.type === 'success'
                ? 'bg-green-500/10 border border-green-500/20'
                : 'bg-destructive/10 border border-destructive/20'
            }`}
          >
            {message.type === 'success' ? (
              <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
            ) : (
              <AlertCircle className="h-5 w-5 text-destructive mt-0.5" />
            )}
            <p
              className={`text-sm ${message.type === 'success' ? 'text-green-500' : 'text-destructive'}`}
            >
              {message.text}
            </p>
          </div>
        )}

        <div className="p-3 bg-muted/30 rounded-lg">
          <p className="text-xs text-muted-foreground">
            <strong>Note:</strong> Spoofed tiers persist until reset. This allows you to test
            tier-gated features without changing your actual Patreon subscription. The spoofed tier
            is stored in your profile and will override the real Patreon tier until reset.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
