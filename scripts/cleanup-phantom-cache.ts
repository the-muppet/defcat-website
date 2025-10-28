#!/usr/bin/env node

/**
 * Cleanup Phantom Cache Script
 * Fixes database entries to match actual images in storage
 * - Keeps cached_image_url for cards with actual images
 * - Clears cached_image_url for phantom entries
 */

import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

const __dirname = dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: join(__dirname, '..', '.env.local') })

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('❌ Missing environment variables')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY)

async function main() {
  console.log('🧹 Phantom Cache Cleanup Script\n')

  // Read the list of scryfall_ids that actually have images
  console.log('📄 Reading images.txt...')
  const imagesPath = join(__dirname, '..', 'images.txt')
  const imagesScryfallIds = readFileSync(imagesPath, 'utf-8')
    .split('\n')
    .map((id) => id.trim())
    .filter((id) => id.length > 0)

  console.log(`✅ Found ${imagesScryfallIds.length} actual images in storage\n`)

  // Get current state
  console.log('📊 Checking current database state...')

  const { count: cachedCount } = await supabase
    .from('cards')
    .select('*', { count: 'exact', head: true })
    .not('cached_image_url', 'is', null)

  const { count: totalWithScryfall } = await supabase
    .from('cards')
    .select('*', { count: 'exact', head: true })
    .not('scryfall_id', 'is', null)

  console.log(`   Cards with cached_image_url: ${cachedCount}`)
  console.log(`   Total cards with scryfall_id: ${totalWithScryfall}`)
  console.log(`   Phantom entries: ${cachedCount - imagesScryfallIds.length}\n`)

  // Step 1: Set correct cached_image_url for the 198 that exist
  console.log('🔧 Step 1: Setting correct URLs for existing images...')

  const correctUrl = (scryfallId: string) =>
    `${SUPABASE_URL}/storage/v1/object/public/media/card-images/${scryfallId}.jpg`

  let updated = 0
  for (const scryfallId of imagesScryfallIds) {
    const { error } = await supabase
      .from('cards')
      .update({
        cached_image_url: correctUrl(scryfallId),
        cache_attempts: 1,
        last_cache_attempt_at: new Date().toISOString(),
        cache_error: null,
      })
      .eq('scryfall_id', scryfallId)

    if (!error) {
      updated++
      if (updated % 50 === 0) {
        console.log(`   Updated ${updated}/${imagesScryfallIds.length}...`)
      }
    }
  }

  console.log(`✅ Updated ${updated} cards with correct URLs\n`)

  // Step 2: Clear phantom cached_image_url entries
  console.log('🧹 Step 2: Clearing phantom entries...')

  const { error: clearError, count: clearedCount } = await supabase
    .from('cards')
    .update({
      cached_image_url: null,
      cache_attempts: 0,
      last_cache_attempt_at: null,
      cache_error: null,
    })
    .not('cached_image_url', 'is', null)
    .not('scryfall_id', 'in', `(${imagesScryfallIds.map((id) => `'${id}'`).join(',')})`)

  if (clearError) {
    console.error('❌ Error clearing phantom entries:', clearError)
  } else {
    console.log(`✅ Cleared ${clearedCount || 'N/A'} phantom entries\n`)
  }

  // Step 3: Verify final state
  console.log('📊 Final state:')

  const { count: finalCached } = await supabase
    .from('cards')
    .select('*', { count: 'exact', head: true })
    .not('cached_image_url', 'is', null)

  const { count: finalUncached } = await supabase
    .from('cards')
    .select('*', { count: 'exact', head: true })
    .is('cached_image_url', null)
    .not('scryfall_id', 'is', null)

  console.log(`   Cached: ${finalCached} (should be ~${imagesScryfallIds.length})`)
  console.log(`   Uncached: ${finalUncached} (ready for backfill)`)
  console.log(`   Total: ${finalCached + finalUncached}\n`)

  if (finalCached !== imagesScryfallIds.length) {
    console.warn(`⚠️  Warning: Expected ${imagesScryfallIds.length} cached, but got ${finalCached}`)
    console.warn('   Some scryfall_ids from images.txt may not exist in database')
  } else {
    console.log('✅ Database is now clean and ready for backfill!')
  }
}

main().catch((error) => {
  console.error('💥 Fatal error:', error)
  process.exit(1)
})
