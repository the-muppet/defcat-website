'use client'

import { AlertCircle, CheckCircle, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { PatreonTier } from '@/types/core'

export function DeckImportForm() {
  const router = useRouter()
  const [moxfieldInput, setMoxfieldInput] = useState('')
  const [selectedTier, setSelectedTier] = useState<PatreonTier>('Citizen')
  const [isImporting, setIsImporting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const extractMoxfieldId = (input: string): string | null => {
    // Handle full URL: https://www.moxfield.com/decks/abc123xyz
    const urlMatch = input.match(/moxfield\.com\/decks\/([a-zA-Z0-9_-]+)/)
    if (urlMatch) {
      return urlMatch[1]
    }

    // Handle direct ID
    if (/^[a-zA-Z0-9_-]+$/.test(input.trim())) {
      return input.trim()
    }

    return null
  }

  const handleImport = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(false)

    const moxfieldId = extractMoxfieldId(moxfieldInput)

    if (!moxfieldId) {
      setError('Invalid Moxfield URL or ID. Please enter a valid deck link or ID.')
      return
    }

    setIsImporting(true)

    try {
      const response = await fetch('/api/admin/decks/import', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          moxfieldId,
          tier: selectedTier,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to import deck')
      }

      setSuccess(true)
      setMoxfieldInput('')

      // Redirect to deck management after 2 seconds
      setTimeout(() => {
        router.push('/admin/decks')
      }, 2000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred')
    } finally {
      setIsImporting(false)
    }
  }

  return (
    <form onSubmit={handleImport} className="space-y-6">
      {/* Moxfield URL/ID Input */}
      <div className="space-y-2">
        <Label htmlFor="moxfield-input">Moxfield Deck URL or ID</Label>
        <Input
          id="moxfield-input"
          type="text"
          placeholder="https://www.moxfield.com/decks/abc123xyz or abc123xyz"
          value={moxfieldInput}
          onChange={(e) => setMoxfieldInput(e.target.value)}
          disabled={isImporting}
          className="glass-input"
        />
        <p className="text-sm text-muted-foreground">
          Enter the full Moxfield URL or just the deck ID
        </p>
      </div>

      {/* Tier Selection */}
      <div className="space-y-2">
        <Label htmlFor="tier-select">Required Patreon Tier</Label>
        <Select
          value={selectedTier}
          onValueChange={(value) => setSelectedTier(value as PatreonTier)}
          disabled={isImporting}
        >
          <SelectTrigger id="tier-select" className="glass-input">
            <SelectValue placeholder="Select a tier" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Citizen">Citizen (Free)</SelectItem>
            <SelectItem value="Knight">Knight</SelectItem>
            <SelectItem value="Emissary">Emissary</SelectItem>
            <SelectItem value="Duke">Duke</SelectItem>
            <SelectItem value="Wizard">Wizard</SelectItem>
            <SelectItem value="ArchMage">ArchMage</SelectItem>
          </SelectContent>
        </Select>
        <p className="text-sm text-muted-foreground">
          Users must have this tier or higher to view the deck
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Success Message */}
      {success && (
        <Alert className="border-green-500/50 bg-green-500/10">
          <CheckCircle className="h-4 w-4 text-green-500" />
          <AlertDescription className="text-green-500">
            Deck imported successfully! Redirecting...
          </AlertDescription>
        </Alert>
      )}

      {/* Submit Button */}
      <Button type="submit" disabled={isImporting || !moxfieldInput.trim()} className="w-full">
        {isImporting ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Importing Deck...
          </>
        ) : (
          'Import Deck'
        )}
      </Button>
    </form>
  )
}
