#!/usr/bin/env node

/**
 * Simple table existence check
 */

import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

const __dirname = dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: join(__dirname, '..', '.env.local') })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function main() {
  console.log('🔍 Checking tables...\n')

  const tables = ['decks', 'cards', 'deck_cards']

  for (const table of tables) {
    const { data, error } = await supabase.from(table).select('*').limit(1)

    if (error) {
      console.log(`❌ "${table}": ${error.message}`)
    } else {
      console.log(`✅ "${table}": OK (${data?.length || 0} samples)`)
    }
  }

  // Check for relationship
  console.log('\n🔗 Testing relationship query...')
  const { data: decks } = await supabase.from('decks').select('id').limit(1)

  if (decks && decks.length > 0) {
    const { data, error } = await supabase
      .from('deck_cards')
      .select(`
        quantity,
        cards (
          name
        )
      `)
      .eq('deck_id', decks[0].id)
      .limit(1)

    if (error) {
      console.log(`❌ Relationship query failed: ${error.message}`)
      console.log("\n💡 This is the 404 error you're seeing in the browser!")
    } else {
      console.log(`✅ Relationship query works!`)
    }
  }
}

main()
