'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { FileText, Trash2, Edit, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

interface DraftSubmission {
  id: string
  created_at: string
  commander: string | null
  color_preference: string | null
  bracket: string | null
  mystery_deck: boolean
}

export function MyDrafts() {
  const [drafts, setDrafts] = useState<DraftSubmission[]>([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState<string | null>(null)

  useEffect(() => {
    loadDrafts()
  }, [])

  async function loadDrafts() {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return

    const { data, error } = await supabase
      .from('deck_submissions')
      .select('id, created_at, commander, color_preference, bracket, mystery_deck')
      .eq('user_id', user.id)
      .eq('status', 'draft')
      .order('created_at', { ascending: false })

    if (!error && data) {
      setDrafts(data)
    }
    setLoading(false)
  }

  async function deleteDraft(id: string) {
    if (!confirm('Are you sure you want to delete this draft?')) return

    setDeleting(id)
    const supabase = createClient()

    const { error } = await supabase
      .from('deck_submissions')
      .delete()
      .eq('id', id)

    if (!error) {
      setDrafts(drafts.filter(d => d.id !== id))
    }
    setDeleting(null)
  }

  if (loading) {
    return (
      <Card className="glass-panel">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            My Drafts
          </CardTitle>
          <CardDescription>Your saved deck submission drafts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="glass-panel">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          My Drafts
        </CardTitle>
        <CardDescription>
          Your saved deck submission drafts ({drafts.length}/5)
          {drafts.length >= 5 && (
            <span className="text-yellow-500 ml-2">• Limit reached</span>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {drafts.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>No draft submissions</p>
            <p className="text-sm mt-1">Start a new submission to save drafts</p>
          </div>
        ) : (
          <div className="space-y-3">
            {drafts.map((draft) => (
              <div
                key={draft.id}
                className="flex items-center justify-between p-4 rounded-lg bg-accent-tinted border border-tinted hover:bg-accent-tinted/80 transition-all"
              >
                <div className="flex-1">
                  <div className="font-medium">
                    {draft.mystery_deck ? 'Mystery Deck' : (draft.commander || 'Custom Build')}
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">
                    {draft.color_preference && `Colors: ${draft.color_preference}`}
                    {draft.bracket && ` • ${draft.bracket}`}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Saved {new Date(draft.created_at).toLocaleDateString()}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    asChild
                    size="sm"
                    variant="outline"
                    className="border-tinted hover:bg-accent-tinted"
                  >
                    <Link href={`/decks/submission?draft=${draft.id}`}>
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Link>
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-red-500/20 hover:bg-red-500/10 text-red-500"
                    onClick={() => deleteDraft(draft.id)}
                    disabled={deleting === draft.id}
                  >
                    {deleting === draft.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
