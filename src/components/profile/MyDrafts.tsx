'use client'

import { Edit, FileText, Loader2, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'

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
    const {
      data: { user },
    } = await supabase.auth.getUser()

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

    const { error } = await supabase.from('deck_submissions').delete().eq('id', id)

    if (!error) {
      setDrafts(drafts.filter((d) => d.id !== id))
    }
    setDeleting(null)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (drafts.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
        <p>No draft submissions</p>
        <p className="text-sm mt-1">Start a new submission to save drafts</p>
      </div>
    )
  }

  return (
    <Accordion type="single" collapsible className="w-full">
      {drafts.map((draft) => (
        <AccordionItem key={draft.id} value={`draft-${draft.id}`}>
          <AccordionTrigger className="hover:no-underline">
            <div className="flex items-center justify-between w-full pr-4">
              <span className="font-medium">
                {draft.mystery_deck ? 'Mystery Deck' : draft.commander || 'Custom Build'}
              </span>
              <span className="text-xs text-muted-foreground">
                {new Date(draft.created_at).toLocaleDateString()}
              </span>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-3 pt-2">
              <div className="text-sm space-y-1">
                {draft.color_preference && (
                  <div>
                    <span className="text-muted-foreground">Colors:</span>
                    <span className="ml-2 font-medium">{draft.color_preference}</span>
                  </div>
                )}
                {draft.bracket && (
                  <div>
                    <span className="text-muted-foreground">Bracket:</span>
                    <span className="ml-2 font-medium">{draft.bracket}</span>
                  </div>
                )}
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
                    Edit Draft
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
                    <>
                      <Trash2 className="h-4 w-4 mr-1" />
                      Delete
                    </>
                  )}
                </Button>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  )
}
