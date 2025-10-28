#!/usr/bin/env node

/**
 * Backfill Card Images Script
 * Processes all uncached cards by calling the cache-card-images edge function in batches
 */

import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: join(__dirname, '..', '.env.local') })

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
const TEST_MODE = process.argv.includes('--test')
const BATCH_SIZE = TEST_MODE ? 1 : 100
const DELAY_BETWEEN_BATCHES_MS = 2000 // 2 seconds between batches

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('❌ Missing environment variables')
  console.error('   NEXT_PUBLIC_SUPABASE_URL:', SUPABASE_URL ? '✓' : '✗')
  console.error('   SUPABASE_SERVICE_ROLE_KEY:', SERVICE_ROLE_KEY ? '✓' : '✗')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY)

async function getUncachedCount(): Promise<number> {
  const { count, error } = await supabase
    .from('cards')
    .select('*', { count: 'exact', head: true })
    .not('scryfall_id', 'is', null)
    .is('cached_image_url', null)

  if (error) {
    throw new Error(`Failed to count uncached cards: ${error.message}`)
  }

  return count || 0
}

async function processBatch(offset: number, batchSize: number) {
  const edgeFunctionUrl = `${SUPABASE_URL}/functions/v1/cache-images`

  const response = await fetch(edgeFunctionUrl, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      batchSize: batchSize,
      offset: offset,
    }),
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Edge function failed: ${response.status} - ${errorText}`)
  }

  const result = await response.json()
  return result
}

async function main() {
  console.log('🎴 Card Image Backfill Script')
  if (TEST_MODE) {
    console.log('🧪 TEST MODE: Will process only 10 cards\n')
  } else {
    console.log()
  }

  // Get initial count
  console.log('📊 Checking uncached cards...')
  const initialCount = await getUncachedCount()

  if (initialCount === 0) {
    console.log('✅ All cards are already cached!')
    return
  }

  console.log(`📦 Total uncached cards: ${initialCount}`)
  console.log(`🔢 Batch size: ${BATCH_SIZE}`)
  console.log(`⏱️  Delay between batches: ${DELAY_BETWEEN_BATCHES_MS}ms\n`)

  const estimatedBatches = Math.ceil(initialCount / BATCH_SIZE)
  const estimatedTimeMinutes = Math.ceil((estimatedBatches * (BATCH_SIZE * 100 + DELAY_BETWEEN_BATCHES_MS)) / 60000)

  console.log(`⏳ Estimated batches: ${estimatedBatches}`)
  console.log(`⏳ Estimated time: ~${estimatedTimeMinutes} minutes\n`)

  const startTime = Date.now()
  let totalProcessed = 0
  let totalSuccess = 0
  let totalFailed = 0
  let batchNumber = 0
  let consecutiveFailures = 0
  const MAX_CONSECUTIVE_FAILURES = 5

  while (true) {
    batchNumber++
    const offset = 0 // Always use offset 0 because successful cards are removed from the pool

    console.log(`\n📦 Batch ${batchNumber}/${estimatedBatches} (offset: ${offset})`)

    try {
      const result = await processBatch(offset, BATCH_SIZE)

      // Reset consecutive failures on successful batch
      consecutiveFailures = 0

      totalProcessed += result.processed || 0
      totalSuccess += result.successCount || 0
      totalFailed += result.failedCount || 0

      console.log(`   ✅ Success: ${result.successCount}`)
      console.log(`   ❌ Failed: ${result.failedCount}`)
      console.log(`   📊 Remaining: ${result.remainingUncached}`)

      // Show failed cards if any
      if (result.failedCards && result.failedCards.length > 0) {
        console.log(`   Failed cards:`)
        result.failedCards.forEach((f: any) => {
          console.log(`      • ${f.card}: ${f.error}`)
        })
      }

      // Check if done
      if (result.processed === 0 || result.remainingUncached === 0) {
        console.log('\n✅ All cards processed!')
        break
      }

      // Stop if batch had all failures (stuck on bad cards)
      if (result.successCount === 0 && result.failedCount > 0) {
        console.log('\n⚠️  No successful caches in this batch. Stopping to prevent infinite loop.')
        console.log('   Cards with 3+ failed attempts will be skipped automatically.')
        break
      }

      // Exit after one batch in test mode
      if (TEST_MODE) {
        console.log('\n🧪 Test mode: Exiting after one batch')
        break
      }

      // Delay between batches
      if (DELAY_BETWEEN_BATCHES_MS > 0) {
        console.log(`   ⏸️  Waiting ${DELAY_BETWEEN_BATCHES_MS}ms before next batch...`)
        await new Promise((resolve) => setTimeout(resolve, DELAY_BETWEEN_BATCHES_MS))
      }
    } catch (error) {
      consecutiveFailures++
      console.error(`\n❌ Batch ${batchNumber} failed:`, error)

      if (consecutiveFailures >= MAX_CONSECUTIVE_FAILURES) {
        console.error(`\n💥 ${MAX_CONSECUTIVE_FAILURES} consecutive failures. Stopping.`)
        console.error('   Please check:')
        console.error('   1. Migration applied: bun run db:up')
        console.error('   2. Edge function deployed with latest changes')
        break
      }

      console.log(`   Continuing to next batch... (${consecutiveFailures}/${MAX_CONSECUTIVE_FAILURES} consecutive failures)\n`)

      // Wait before retrying
      await new Promise((resolve) => setTimeout(resolve, DELAY_BETWEEN_BATCHES_MS))
    }
  }

  const durationMs = Date.now() - startTime
  const durationMinutes = Math.floor(durationMs / 60000)
  const durationSeconds = Math.floor((durationMs % 60000) / 1000)

  console.log('\n' + '='.repeat(50))
  console.log('🎉 Backfill Complete!')
  console.log('='.repeat(50))
  console.log(`📊 Total processed: ${totalProcessed}`)
  console.log(`✅ Success: ${totalSuccess}`)
  console.log(`❌ Failed: ${totalFailed}`)
  console.log(`⏱️  Duration: ${durationMinutes}m ${durationSeconds}s`)
  console.log('='.repeat(50))

  // Final count check
  const finalCount = await getUncachedCount()
  if (finalCount > 0) {
    console.log(`\n⚠️  Warning: ${finalCount} cards still uncached (likely failed)`)
    console.log('   You can re-run this script to retry failed cards')
  } else {
    console.log('\n✨ All cards successfully cached!')
  }
}

main()
  .catch((error) => {
    console.error('💥 Fatal error:', error)
    process.exit(1)
  })
