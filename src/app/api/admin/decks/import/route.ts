import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(request: NextRequest) {
  try {
    const supabase = createAdminClient()

    // Get request body
    const body = await request.json()
    const { moxfieldId, tier } = body

    if (!moxfieldId) {
      return NextResponse.json(
        { success: false, error: 'Moxfield ID is required' },
        { status: 400 }
      )
    }

    // Fetch deck from Moxfield API
    const moxfieldUrl = `https://api2.moxfield.com/v3/decks/all/${moxfieldId}`
    const response = await fetch(moxfieldUrl)

    if (!response.ok) {
      return NextResponse.json(
        { success: false, error: 'Failed to fetch deck from Moxfield' },
        { status: 404 }
      )
    }

    const deckData = await response.json()

    // Insert or update deck in database
    const { data: deck, error: deckError } = await supabase
      .from('decks')
      .upsert({
        moxfield_id: moxfieldId,
        name: deckData.name,
        description: deckData.description || null,
        commanders: deckData.commanders?.map((c: any) => c.card?.name).filter(Boolean) || [],
        color_identity: deckData.colorIdentity || [],
        moxfield_url: `https://www.moxfield.com/decks/${moxfieldId}`,
        required_tier: tier || 'Citizen',
        view_count: 0,
        like_count: 0,
      })
      .select()
      .single()

    if (deckError) {
      console.error('Supabase error:', deckError)
      return NextResponse.json(
        { success: false, error: 'Failed to save deck to database' },
        { status: 500 }
      )
    }

    // Import cards
    if (deckData.boards?.mainboard) {
      const cards = Object.entries(deckData.boards.mainboard.cards || {}).map(
        ([id, cardData]: [string, any]) => ({
          moxfield_deck_id: moxfieldId,
          card_id: cardData.card?.id || id,
          card_name: cardData.card?.name || '',
          quantity: cardData.quantity || 1,
          board: 'mainboard',
        })
      )

      if (cards.length > 0) {
        await supabase.from('decklist_cards').upsert(cards)
      }
    }

    return NextResponse.json({
      success: true,
      data: { deck },
    })
  } catch (error) {
    console.error('Import error:', error)
    return NextResponse.json(
      { success: false, error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}
