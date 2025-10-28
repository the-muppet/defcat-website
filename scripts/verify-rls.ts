#!/usr/bin/env tsx

/**
 * Verify and Fix RLS Policies
 * Checks if RLS policies are correctly applied and fixes them if needed
 */

import { createClient } from '@supabase/supabase-js'
import { requireValidEnv } from '../src/lib/env'

const env = requireValidEnv()

// Create admin client with service role key
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

async function verifyRLSPolicies() {
  console.log('🔍 Verifying RLS Policies...\n')

  try {
    // Check if RLS is enabled on tables
    const { data: tables, error: tablesError } = await supabase
      .rpc('pg_tables_with_rls')
      .select('*')

    if (tablesError) {
      console.log('⚠️  Cannot query RLS status directly, will verify by testing queries\n')
    }

    // Test deck_cards query with anon client
    console.log('Testing deck_cards query with anon key...')
    const anonClient = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY)

    // First, get a sample deck_id
    const { data: decks, error: decksError } = await anonClient.from('decks').select('id').limit(1)

    if (decksError) {
      console.error('❌ Error fetching decks:', decksError)
      return
    }

    if (!decks || decks.length === 0) {
      console.log('⚠️  No decks found in database. Please import decks first.')
      return
    }

    const testDeckId = decks[0].id
    console.log(`Using deck ID: ${testDeckId}`)

    // Test deck_cards query
    const { data: deckCards, error: deckCardsError } = await anonClient
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
      .eq('deck_id', testDeckId)
      .eq('board_type', 'mainboard')

    if (deckCardsError) {
      console.error('❌ Error fetching deck_cards:', deckCardsError)
      console.log('\n🔧 Attempting to fix RLS policies...\n')
      await fixRLSPolicies()
      return
    }

    console.log('✅ deck_cards query successful!')
    console.log(`Found ${deckCards?.length || 0} cards\n`)

    // Test cards table
    const { data: cards, error: cardsError } = await anonClient.from('cards').select('*').limit(1)

    if (cardsError) {
      console.error('❌ Error fetching cards:', cardsError)
      await fixRLSPolicies()
      return
    }

    console.log('✅ cards query successful!\n')

    console.log('✅ All RLS policies are working correctly!')
  } catch (error) {
    console.error('❌ Unexpected error:', error)
    throw error
  }
}

async function fixRLSPolicies() {
  console.log('🔧 Fixing RLS policies...\n')

  const policies = [
    {
      table: 'cards',
      policy: `
        DROP POLICY IF EXISTS "Public read access for cards" ON cards;
        CREATE POLICY "Public read access for cards" ON cards FOR SELECT USING (true);
      `,
    },
    {
      table: 'decks',
      policy: `
        DROP POLICY IF EXISTS "Public read access for decks" ON decks;
        CREATE POLICY "Public read access for decks" ON decks FOR SELECT USING (true);
      `,
    },
    {
      table: 'deck_cards',
      policy: `
        DROP POLICY IF EXISTS "Public read access for deck_cards" ON deck_cards;
        CREATE POLICY "Public read access for deck_cards" ON deck_cards FOR SELECT USING (true);
      `,
    },
  ]

  for (const { table, policy } of policies) {
    console.log(`Applying policy for ${table}...`)
    const { error } = await supabase.rpc('exec_sql', { sql: policy })

    if (error) {
      console.error(`❌ Error applying policy for ${table}:`, error)
    } else {
      console.log(`✅ Policy applied for ${table}`)
    }
  }

  console.log('\n✅ RLS policies fixed! Please test again.\n')
}

// Run verification
verifyRLSPolicies()
  .then(() => {
    console.log('Done!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('Fatal error:', error)
    process.exit(1)
  })
