#!/usr/bin/env node

/**
 * Debug deck data issues
 */

import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: join(__dirname, '..', '.env.local') })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function main() {
  console.log('🔍 Debugging deck data...\n')

  // Test 1: Check decks table
  console.log('Test 1: Fetching sample decks...')
  const { data: decks, error: decksError } = await supabase
    .from('decks')
    .select('id, name, moxfield_id, commanders, color_identity')
    .limit(3)

  if (decksError) {
    console.error('❌ Error fetching decks:', decksError)
    return
  }

  console.log(`✅ Found ${decks?.length || 0} decks`)
  decks?.forEach((deck) => {
    console.log(`\n  📦 ${deck.name}`)
    console.log(`     ID: ${deck.id}`)
    console.log(`     Moxfield ID: ${deck.moxfield_id}`)
    console.log(`     Commanders: ${JSON.stringify(deck.commanders)}`)
    console.log(`     Color Identity: ${JSON.stringify(deck.color_identity)}`)
  })

  if (!decks || decks.length === 0) {
    console.log('\n⚠️  No decks found in database!')
    return
  }

  // Test 2: Check if decklist_cards exist for these decks
  console.log('\n\nTest 2: Checking decklist_cards for first deck...')
  const firstDeck = decks[0]

  const { data: decklistCards, error: decklistError } = await supabase
    .from('decklist_cards')
    .select('id, card_name, quantity, board')
    .eq('moxfield_deck_id', firstDeck.moxfield_id)
    .limit(5)

  if (decklistError) {
    console.error('❌ Error fetching decklist_cards:', decklistError)
  } else {
    console.log(`✅ Found ${decklistCards?.length || 0} cards for "${firstDeck.name}"`)
    if (decklistCards && decklistCards.length > 0) {
      decklistCards.forEach((card) => {
        console.log(`   - ${card.card_name} x${card.quantity} (${card.board})`)
      })
    } else {
      console.log('   ⚠️  No cards found! Deck may not have been imported yet.')
    }
  }

  // Test 3: Check moxfield_decks table
  console.log('\n\nTest 3: Checking moxfield_decks table...')
  const { data: moxfieldDecks, error: moxfieldError } = await supabase
    .from('moxfield_decks')
    .select('moxfield_id, name')
    .limit(3)

  if (moxfieldError) {
    console.error('❌ Error:', moxfieldError.message)
  } else {
    console.log(`✅ Found ${moxfieldDecks?.length || 0} moxfield_decks entries`)
    moxfieldDecks?.forEach((d) => console.log(`   - ${d.name} (${d.moxfield_id})`))
  }

  // Test 4: Check if there's a mismatch
  console.log('\n\nTest 4: Checking for moxfield_id mismatches...')
  const { data: allDecklistCards } = await supabase
    .from('decklist_cards')
    .select('moxfield_deck_id')
    .limit(1)

  if (allDecklistCards && allDecklistCards.length > 0) {
    const sampleMoxfieldId = allDecklistCards[0].moxfield_deck_id
    console.log(`   Sample moxfield_deck_id from decklist_cards: "${sampleMoxfieldId}"`)

    const { data: matchingDeck } = await supabase
      .from('decks')
      .select('id, name, moxfield_id')
      .eq('moxfield_id', sampleMoxfieldId)
      .single()

    if (matchingDeck) {
      console.log(`   ✅ Found matching deck: "${matchingDeck.name}"`)
    } else {
      console.log(`   ⚠️  No deck found with moxfield_id "${sampleMoxfieldId}"`)
      console.log('      This indicates a data mismatch!')
    }
  }

  // Test 5: Test the actual query from useDecklist
  console.log('\n\nTest 5: Testing useDecklist query flow...')
  const testDeckId = decks[0].id

  // Step 1: Get moxfield_id
  const { data: deckInfo } = await supabase
    .from('decks')
    .select('moxfield_id')
    .eq('id', testDeckId)
    .single()

  console.log(`   Step 1: Got moxfield_id = "${deckInfo?.moxfield_id}"`)

  if (deckInfo?.moxfield_id) {
    // Step 2: Query decklist_cards with relationship
    const { data: cards, error: cardsError } = await supabase
      .from('decklist_cards')
      .select(`
        quantity,
        board,
        cards (
          name,
          mana_cost,
          type_line,
          cmc,
          image_url
        )
      `)
      .eq('moxfield_deck_id', deckInfo.moxfield_id)
      .eq('board', 'mainboard')
      .limit(5)

    if (cardsError) {
      console.error('   ❌ Error with relationship query:', cardsError)
    } else {
      console.log(`   ✅ Query successful! Found ${cards?.length || 0} cards`)
      if (cards && cards.length > 0) {
        cards.forEach((c) => {
          console.log(`      - ${c.cards?.name || 'Unknown'} x${c.quantity}`)
        })
      }
    }
  }
}

main()
  .then(() => console.log('\n✅ Debug complete'))
  .catch((error) => {
    console.error('❌ Fatal error:', error)
    process.exit(1)
  })
