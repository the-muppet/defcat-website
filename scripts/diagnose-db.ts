#!/usr/bin/env tsx

/**
 * Diagnose Database Issues
 * Tests database connectivity and relationship queries
 */

import { createClient } from '@supabase/supabase-js'
import { requireValidEnv } from '../src/lib/env'

const env = requireValidEnv()

async function main() {
  console.log('🔍 Diagnosing database issues...\n')

  // Test with anon client (what the browser uses)
  const anonClient = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY)

  // Test 1: Can we fetch decks?
  console.log('Test 1: Fetching decks...')
  const { data: decks, error: decksError } = await anonClient
    .from('decks')
    .select('id, name')
    .limit(1)

  if (decksError) {
    console.error('❌ Error:', decksError)
    process.exit(1)
  }

  console.log(`✅ Found ${decks?.length || 0} deck(s)`)
  if (decks && decks.length > 0) {
    console.log(`   Using deck: "${decks[0].name}" (${decks[0].id})\n`)

    const deckId = decks[0].id

    // Test 2: Can we fetch deck_cards directly?
    console.log('Test 2: Fetching deck_cards (no join)...')
    const { data: deckCards, error: deckCardsError } = await anonClient
      .from('deck_cards')
      .select('id, deck_id, card_id, quantity, board_type')
      .eq('deck_id', deckId)
      .limit(5)

    if (deckCardsError) {
      console.error('❌ Error:', deckCardsError)
    } else {
      console.log(`✅ Found ${deckCards?.length || 0} deck_card(s)`)
      if (deckCards && deckCards.length > 0) {
        console.log(
          `   Sample: card_id=${deckCards[0].card_id}, quantity=${deckCards[0].quantity}\n`
        )
      } else {
        console.log('⚠️  No deck_cards found for this deck!\n')
      }
    }

    // Test 3: Can we fetch cards directly?
    if (deckCards && deckCards.length > 0) {
      const cardId = deckCards[0].card_id
      console.log('Test 3: Fetching card directly...')
      const { data: card, error: cardError } = await anonClient
        .from('cards')
        .select('id, name, mana_cost')
        .eq('id', cardId)
        .single()

      if (cardError) {
        console.error('❌ Error:', cardError)
      } else {
        console.log(`✅ Found card: "${card?.name}"\n`)
      }
    }

    // Test 4: Try the relationship query (this is what's failing)
    console.log('Test 4: Fetching deck_cards with card relationship...')
    const { data: joined, error: joinError } = await anonClient
      .from('deck_cards')
      .select(`
        quantity,
        board_type,
        cards (
          name,
          mana_cost,
          type_line,
          cmc,
          image_url
        )
      `)
      .eq('deck_id', deckId)
      .eq('board_type', 'mainboard')
      .limit(5)

    if (joinError) {
      console.error('❌ Error with relationship query:', joinError)
      console.log('\n📋 This is the error causing the 404 in your browser!')
      console.log(
        '   The relationship between deck_cards and cards may not be recognized by Supabase.'
      )
      console.log(
        '\n💡 Solution: The foreign key exists, but Supabase PostgREST may need to be refreshed.'
      )
      console.log('   Try reloading the schema in Supabase Dashboard > API > Reload Schema\n')
    } else {
      console.log(`✅ Relationship query worked! Found ${joined?.length || 0} cards`)
      console.log('   The issue may have been temporary.\n')
    }
  }

  console.log('✅ Diagnosis complete!')
}

main().catch((error) => {
  console.error('Fatal error:', error)
  process.exit(1)
})
