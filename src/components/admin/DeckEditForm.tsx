'use client'

import { Loader2, Save, Trash2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import type { Database } from '@/types/supabase'

type Deck = Database['public']['Tables']['decks']['Row']

interface DeckEditFormProps {
  deck: Deck
}

export function DeckEditForm({ deck }: DeckEditFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [formData, setFormData] = useState({
    name: deck.name || '',
    description: deck.description || '',
    commanders: deck.commanders?.join(', ') || '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch(`/api/admin/decks/${deck.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description || null,
          commanders: formData.commanders
            .split(',')
            .map((c) => c.trim())
            .filter(Boolean),
        }),
      })

      if (response.ok) {
        router.refresh()
        alert('Deck updated successfully!')
      } else {
        const error = await response.json()
        alert(`Error: ${error.error || 'Failed to update deck'}`)
      }
    } catch (error) {
      console.error('Error updating deck:', error)
      alert('Failed to update deck')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to delete "${deck.name}"? This cannot be undone.`)) {
      return
    }

    setDeleting(true)

    try {
      const response = await fetch(`/api/admin/decks/${deck.id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        router.push('/admin/decks')
      } else {
        const error = await response.json()
        alert(`Error: ${error.error || 'Failed to delete deck'}`)
      }
    } catch (error) {
      console.error('Error deleting deck:', error)
      alert('Failed to delete deck')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Deck Name */}
      <div className="space-y-2">
        <Label htmlFor="name">Deck Name</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
        />
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          rows={4}
        />
      </div>

      {/* Commanders */}
      <div className="space-y-2">
        <Label htmlFor="commanders">Commanders (comma-separated)</Label>
        <Input
          id="commanders"
          value={formData.commanders}
          onChange={(e) => setFormData({ ...formData, commanders: e.target.value })}
          placeholder="Tymna the Weaver, Kraum, Ludevic's Opus"
        />
        <p className="text-xs text-muted-foreground">
          Color identity will be automatically derived from commanders
        </p>
      </div>

      {/* Read-only fields */}
      <div className="grid grid-cols-3 gap-4 pt-4 border-t">
        <div className="space-y-2">
          <Label className="text-muted-foreground">Color Identity</Label>
          <p className="text-sm">{deck.color_identity?.join('') || 'None'}</p>
        </div>
        <div className="space-y-2">
          <Label className="text-muted-foreground">Moxfield ID</Label>
          <p className="text-sm">{deck.moxfield_id}</p>
        </div>
        <div className="space-y-2">
          <Label className="text-muted-foreground">Views</Label>
          <p className="text-sm">{deck.view_count || 0}</p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-4 pt-4 border-t">
        <Button type="submit" disabled={loading}>
          {loading ? (
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

        <Button type="button" variant="destructive" onClick={handleDelete} disabled={deleting}>
          {deleting ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Deleting...
            </>
          ) : (
            <>
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Deck
            </>
          )}
        </Button>
      </div>
    </form>
  )
}
