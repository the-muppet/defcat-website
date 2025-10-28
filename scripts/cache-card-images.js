#!/usr/bin/env node

/**
 * Cache Card Images Script
 * Downloads images from Scryfall and stores them in Supabase Storage
 */

import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: join(__dirname, '..', '.env.local') })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

const STORAGE_BUCKET = 'media'
const STORAGE_PATH = 'card-images'
const DELAY_MS = 100 // 100ms delay between requests (10 req/sec)

function getScryfallImageUrl(scryfallId) {
  return `https://cards.scryfall.io/normal/front/${scryfallId[0]}/${scryfallId[1]}/${scryfallId}.jpg`
}

async function cacheCardImage(card) {
  try {
    // Check if already cached
    if (card.cached_image_url) {
      return { success: true, cached: true }
    }

    // Download from Scryfall
    const scryfallUrl = getScryfallImageUrl(card.scryfall_id)
    const response = await fetch(scryfallUrl)

    if (!response.ok) {
      return { success: false, error: `HTTP ${response.status}` }
    }

    const imageBlob = await response.blob()

    // Upload to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(`${STORAGE_PATH}/${card.scryfall_id}.jpg`, imageBlob, {
        contentType: 'image/jpeg',
        upsert: true,
      })

    if (uploadError) {
      return { success: false, error: uploadError.message }
    }

    // Get public URL
    const { data: publicUrlData } = supabase.storage
      .from(STORAGE_BUCKET)
      .getPublicUrl(`${STORAGE_PATH}/${card.scryfall_id}.jpg`)

    // Update cards table
    await supabase
      .from('cards')
      .update({ cached_image_url: publicUrlData.publicUrl })
      .eq('id', card.id)

    return { success: true, cached: false }
  } catch (error) {
    return { success: false, error: String(error) }
  }
}

async function main() {
  console.log('🎴 Card Image Caching Script\n')

  // Get all cards that need caching
  console.log('📊 Fetching cards...')
  const { data: cards, error } = await supabase
    .from('cards')
    .select('id, name, scryfall_id, cached_image_url')
    .not('scryfall_id', 'is', null)

  if (error) {
    console.error('❌ Error fetching cards:', error)
    process.exit(1)
  }

  const uncachedCards = cards.filter((c) => !c.cached_image_url)
  const alreadyCached = cards.length - uncachedCards.length

  console.log(`📦 Total cards: ${cards.length}`)
  console.log(`✅ Already cached: ${alreadyCached}`)
  console.log(`⏳ To cache: ${uncachedCards.length}\n`)

  if (uncachedCards.length === 0) {
    console.log('🎉 All cards are already cached!')
    return
  }

  console.log('🚀 Starting caching process...\n')

  let success = 0
  let failed = 0
  let skipped = 0

  for (let i = 0; i < uncachedCards.length; i++) {
    const card = uncachedCards[i]
    const progress = `[${i + 1}/${uncachedCards.length}]`

    const result = await cacheCardImage(card)

    if (result.success) {
      if (result.cached) {
        skipped++
        console.log(`${progress} ⏭️  ${card.name} (already cached)`)
      } else {
        success++
        console.log(`${progress} ✅ ${card.name}`)
      }
    } else {
      failed++
      console.error(`${progress} ❌ ${card.name} - ${result.error}`)
    }

    // Rate limiting
    if (i < uncachedCards.length - 1) {
      await new Promise((resolve) => setTimeout(resolve, DELAY_MS))
    }

    // Progress update every 50 cards
    if ((i + 1) % 50 === 0) {
      console.log(`\n📊 Progress: ${i + 1}/${uncachedCards.length} cards processed\n`)
    }
  }

  console.log('\n✅ Caching complete!')
  console.log(`   Success: ${success}`)
  console.log(`   Failed: ${failed}`)
  console.log(`   Already cached: ${skipped}`)
}

main()
  .catch((error) => {
    console.error('💥 Fatal error:', error)
    process.exit(1)
  })
