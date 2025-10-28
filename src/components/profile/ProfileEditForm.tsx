'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2, Save, X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ProfileEditFormProps {
  userId: string
  currentEmail: string
  currentMoxfieldUsername: string | null
  onSuccess?: () => void
  onCancel?: () => void
}

export function ProfileEditForm({
  userId,
  currentEmail,
  currentMoxfieldUsername,
  onSuccess,
  onCancel,
}: ProfileEditFormProps) {
  const [email, setEmail] = useState(currentEmail)
  const [moxfieldUsername, setMoxfieldUsername] = useState(currentMoxfieldUsername || '')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const supabase = createClient()

  // Sync form state with props when they change
  useEffect(() => {
    setEmail(currentEmail)
    setMoxfieldUsername(currentMoxfieldUsername || '')
  }, [currentEmail, currentMoxfieldUsername])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    setSuccess(false)

    try {
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          email: email.trim(),
          moxfield_username: moxfieldUsername.trim() || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId)

      if (updateError) throw updateError

      setSuccess(true)

      // Call onSuccess to refresh parent data
      if (onSuccess) {
        await onSuccess()
      }

      // Reset success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update profile')
    } finally {
      setIsLoading(false)
    }
  }

  const hasChanges =
    email !== currentEmail || (moxfieldUsername || null) !== (currentMoxfieldUsername || null)

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">Email Address</Label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="bg-accent-tinted border-tinted"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="moxfield_username">Moxfield Username</Label>
        <Input
          id="moxfield_username"
          type="text"
          value={moxfieldUsername}
          onChange={(e) => setMoxfieldUsername(e.target.value)}
          className="bg-accent-tinted border-tinted"
          placeholder="Enter your Moxfield username"
        />
        <p className="text-xs text-muted-foreground">
          Used to link your Moxfield decks to your profile
        </p>
      </div>

      {error && (
        <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-lg">{error}</div>
      )}

      {success && (
        <div className="text-sm text-green-600 bg-green-500/10 p-3 rounded-lg">
          Profile updated successfully!
        </div>
      )}

      <div className="flex gap-2">
        <Button
          type="submit"
          disabled={!hasChanges || isLoading}
          className={cn(
            'flex-1',
            !hasChanges && 'opacity-50 cursor-not-allowed'
          )}
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </>
          )}
        </Button>
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isLoading}
            className="border-tinted"
          >
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>
        )}
      </div>
    </form>
  )
}
