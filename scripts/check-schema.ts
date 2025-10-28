#!/usr/bin/env node

/**
 * Check Database Schema
 * Verifies that critical tables exist
 */

import { createClient } from '@supabase/supabase-js'
import { requireValidEnv } from '../src/lib/env.js'

const env = requireValidEnv()

const supabase = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY
)

async function main() {
  console.log('🔍 Checking database schema...\n')

  const tables = ['decks', 'cards', 'deck_cards', 'profiles', 'deck_submissions']

  for (const table of tables) {
    try {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .limit(0) // Just check if table exists

      if (error) {
        if (error.code === '42P01') {
          console.log(`❌ Table "${table}" does NOT exist`)
        } else {
          console.log(`⚠️  Table "${table}" - Error: ${error.message}`)
        }
      } else {
        console.log(`✅ Table "${table}" exists`)
      }
    } catch (err) {
      console.log(`❌ Error checking "${table}":`, err)
    }
  }

  console.log('\n📊 Checking deck_cards table structure...')
  const { data: deckCards, error: deckCardsError } = await supabase
    .from('deck_cards')
    .select('*')
    .limit(1)

  if (deckCardsError) {
    console.log('❌ Cannot query deck_cards:', deckCardsError.message)
    console.log('\n💡 The deck_cards table likely does not exist.')
    console.log('   You need to run the migrations in supabase/migrations/')
  } else {
    console.log('✅ deck_cards table exists and is queryable')
    console.log(`   Found ${deckCards?.length || 0} sample record(s)`)
  }
}

main()
  .then(() => console.log('\n✅ Schema check complete'))
  .catch((error) => {
    console.error('❌ Fatal error:', error)
    process.exit(1)
  })
