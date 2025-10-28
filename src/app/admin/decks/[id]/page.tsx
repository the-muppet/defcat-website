/**
 * Admin Deck Edit Page
 * Edit individual deck metadata
 */

import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { DeckEditForm } from '@/components/admin/DeckEditForm'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { requireAdmin } from '@/lib/auth/auth-guards'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

interface PageProps {
  params: Promise<{
    id: string
  }>
}

export default async function AdminDeckEditPage({ params }: PageProps) {
  await requireAdmin()

  const { id } = await params
  const supabase = await createClient()

  const { data: deck, error } = await supabase
    .from('moxfield_decks')
    .select('id, moxfield_id, public_url, name, raw_data, format, view_count, like_count, comment_count, mainboard_count, sideboard_count, author_username, created_at, last_updated_at')
    .eq('moxfield_id', id)
    .single()

  if (error || !deck) {
    notFound()
  }

  return (
    <div className="container mx-auto px-4 py-8" data-page="admin-deck-edit">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button asChild variant="outline" size="sm">
            <Link href="/admin/decks">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Decks
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gradient">Edit Deck</h1>
            <p className="text-muted-foreground mt-1">{deck.name}</p>
          </div>
        </div>

        {/* Edit Form */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Deck Details</CardTitle>
            <CardDescription>Update deck metadata and settings</CardDescription>
          </CardHeader>
          <CardContent>
            <DeckEditForm deck={deck} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
