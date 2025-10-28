/**
 * Card Image Caching Service
 * Downloads card images from Scryfall and stores them in Supabase Storage
 */

import type { createClient } from '@supabase/supabase-js'

const STORAGE_BUCKET = 'media'
const STORAGE_PATH = 'card-images'

/**
 * Get Scryfall image URL from scryfall_id
 */
export function getScryfallImageUrl(scryfallId: string): string {
  return `https://cards.scryfall.io/normal/front/${scryfallId[0]}/${scryfallId[1]}/${scryfallId}.jpg`
}

/**
 * Get cached image URL from Supabase Storage
 */
export function getCachedImageUrl(supabaseUrl: string, scryfallId: string): string {
  return `${supabaseUrl}/storage/v1/object/public/${STORAGE_BUCKET}/${STORAGE_PATH}/${scryfallId}.jpg`
}

/**
 * Download image from Scryfall and upload to Supabase Storage
 * Updates the cards table with cached_image_url
 */
export async function cacheCardImage(
  supabase: ReturnType<typeof createClient>,
  cardId: string,
  scryfallId: string
): Promise<{ success: boolean; error?: string; cachedUrl?: string }> {
  try {
    // Download from Scryfall
    const scryfallUrl = getScryfallImageUrl(scryfallId)
    const response = await fetch(scryfallUrl)

    if (!response.ok) {
      return { success: false, error: `Scryfall fetch failed: ${response.status}` }
    }

    const imageBlob = await response.blob()

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(`${STORAGE_PATH}/${scryfallId}.jpg`, imageBlob, {
        contentType: 'image/jpeg',
        upsert: true,
      })

    if (uploadError) {
      return { success: false, error: uploadError.message }
    }

    // Get public URL
    const { data: publicUrlData } = supabase.storage
      .from(STORAGE_BUCKET)
      .getPublicUrl(`${STORAGE_PATH}/${scryfallId}.jpg`)

    const cachedUrl = publicUrlData.publicUrl

    // Update cards table
    const { error: updateError } = await supabase
      .from('cards')
      .update({ cached_image_url: cachedUrl })
      .eq('id', cardId)

    if (updateError) {
      console.warn('Failed to update card with cached URL:', updateError)
    }

    return { success: true, cachedUrl }
  } catch (error) {
    return { success: false, error: String(error) }
  }
}

/**
 * Batch cache card images with rate limiting
 */
export async function batchCacheImages(
  supabase: ReturnType<typeof createClient>,
  cards: Array<{ id: string; scryfall_id: string }>,
  delayMs: number = 100
): Promise<{ success: number; failed: number }> {
  let success = 0
  let failed = 0

  for (const card of cards) {
    const result = await cacheCardImage(supabase, card.id, card.scryfall_id)

    if (result.success) {
      success++
      console.log(`✅ Cached: ${card.scryfall_id}`)
    } else {
      failed++
      console.error(`❌ Failed: ${card.scryfall_id} - ${result.error}`)
    }

    // Rate limiting
    if (delayMs > 0) {
      await new Promise((resolve) => setTimeout(resolve, delayMs))
    }
  }

  return { success, failed }
}
