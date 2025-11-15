/**
 * Admin Deck Management API
 * PATCH - Update deck metadata
 * DELETE - Remove deck and associated data
 */

import { type NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth/server'
import { createClient } from '@/lib/supabase/server'

interface RouteContext {
  params: Promise<{
    id: string
  }>
}

/**
 * PATCH /api/admin/decks/[id]
 * Update deck metadata
 */
export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    // Verify admin access
    await requireAdmin()

    const { id } = await context.params
    const body = await request.json()
    const { name, description, commanders } = body

    // Validate required fields
    if (!name) {
      return NextResponse.json({ error: 'Deck name is required' }, { status: 400 })
    }

    // Validate commanders array
    if (!commanders || !Array.isArray(commanders) || commanders.length === 0) {
      return NextResponse.json({ error: 'At least one commander is required' }, { status: 400 })
    }

    const supabase = await createClient()

    // Update deck (color_identity is derived, not editable)
    const { data, error } = await supabase
      .from('moxfield_decks')
      .update({
        name,
        description,
        commanders,
        updated_at: new Date().toISOString(),
      })
      .eq('moxfield_id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating deck:', error)
      return NextResponse.json({ error: 'Failed to update deck' }, { status: 500 })
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('Error in PATCH /api/admin/decks/[id]:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * DELETE /api/admin/decks/[id]
 * Delete deck and all associated data
 */
export async function DELETE(_request: NextRequest, context: RouteContext) {
  try {
    // Verify admin access
    await requireAdmin()

    const { id } = await context.params
    const supabase = await createClient()

    // Get the deck's moxfield_id first
    const { data: deck, error: fetchError } = await supabase
      .from('moxfield_decks')
      .select('moxfield_id')
      .eq('moxfield_id', id)
      .single()

    if (fetchError || !deck) {
      console.error('Error fetching deck:', fetchError)
      return NextResponse.json({ error: 'Deck not found' }, { status: 404 })
    }

    // Delete decklist_cards first (foreign key constraint)
    const { error: cardsError } = await supabase
      .from('decklist_cards')
      .delete()
      .eq('moxfield_deck_id', deck.moxfield_id)

    if (cardsError) {
      console.error('Error deleting deck cards:', cardsError)
      return NextResponse.json({ error: 'Failed to delete deck cards' }, { status: 500 })
    }

    // Delete deck
    const { error: deckError } = await supabase.from('moxfield_decks').delete().eq('moxfield_id', deck.moxfield_id)

    if (deckError) {
      console.error('Error deleting deck:', deckError)
      return NextResponse.json({ error: 'Failed to delete deck' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in DELETE /api/admin/decks/[id]:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
