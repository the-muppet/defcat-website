// app/api/card-image/route.ts

import { createClient } from '@supabase/supabase-js'
import { type NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

function getSupabaseClient() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
}

interface ScryfallCard {
  id: string
  name: string
  image_uris?: {
    art_crop: string
  }
  card_faces?: Array<{
    image_uris?: {
      art_crop: string
    }
  }>
}

async function fetchFromScryfall(cardName: string): Promise<string | null> {
  try {
    const encodedName = encodeURIComponent(cardName)
    const response = await fetch(`https://api.scryfall.com/cards/named?exact=${encodedName}`, {
      headers: {
        Accept: 'application/json',
      },
    })

    if (!response.ok) {
      return null
    }

    const card: ScryfallCard = await response.json()

    // Handle double-faced cards
    if (card.image_uris?.art_crop) {
      return card.image_uris.art_crop
    } else if (card.card_faces?.[0]?.image_uris?.art_crop) {
      return card.card_faces[0].image_uris.art_crop
    }

    return null
  } catch (error) {
    console.error(`Error fetching from Scryfall for "${cardName}":`, error)
    return null
  }
}

async function downloadAndStoreImage(
  supabase: ReturnType<typeof getSupabaseClient>,
  imageUrl: string,
  cardId: string,
  _cardName: string
): Promise<string | null> {
  try {
    // Download image from Scryfall
    const imageResponse = await fetch(imageUrl)
    if (!imageResponse.ok) return null

    const imageBuffer = await imageResponse.arrayBuffer()
    const fileName = `${cardId}.jpg`
    const filePath = `card-art/${fileName}`

    // Upload to Supabase Storage (media bucket)
    const { error: uploadError } = await supabase.storage
      .from('media')
      .upload(filePath, imageBuffer, {
        contentType: 'image/jpeg',
        upsert: true,
        cacheControl: '31536000', // 1 year
      })

    if (uploadError) {
      console.error('Error uploading to storage:', uploadError)
      return null
    }

    // Get public URL
    const { data: publicUrlData } = supabase.storage.from('media').getPublicUrl(filePath)

    return publicUrlData.publicUrl
  } catch (error) {
    console.error('Error downloading and storing image:', error)
    return null
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const cardId = searchParams.get('id')

    if (!cardId) {
      return NextResponse.json({ error: 'Card ID is required' }, { status: 400 })
    }

    const supabase = getSupabaseClient()
    const fileName = `${cardId}.jpg`
    const filePath = `card-art/${fileName}`

    // Check if image exists in Supabase Storage (media bucket)
    const { data: existingFile } = await supabase.storage.from('media').list('card-art', {
      search: fileName,
    })

    if (existingFile && existingFile.length > 0) {
      // Image exists in storage, return public URL
      const { data: publicUrlData } = supabase.storage.from('media').getPublicUrl(filePath)

      return NextResponse.json(
        { imageUrl: publicUrlData.publicUrl, source: 'storage' },
        {
          headers: {
            'Cache-Control': 'public, s-maxage=31536000, immutable',
          },
        }
      )
    }

    // If not in storage, fetch card details from database
    const { data: card } = await supabase
      .from('cards')
      .select('name, image_url')
      .eq('id', cardId)
      .single()

    if (!card) {
      return NextResponse.json({ error: 'Card not found' }, { status: 404 })
    }

    // If we have cached image_url, return it
    if (card.image_url) {
      return NextResponse.json(
        { imageUrl: card.image_url, source: 'database' },
        {
          headers: {
            'Cache-Control': 'public, s-maxage=31536000, immutable',
          },
        }
      )
    }

    // Fetch from Scryfall and cache
    const scryfallImageUrl = await fetchFromScryfall(card.name)

    if (!scryfallImageUrl) {
      return NextResponse.json({ error: 'Card image not found on Scryfall' }, { status: 404 })
    }

    // Download and store in Supabase Storage
    const storedImageUrl = await downloadAndStoreImage(
      supabase,
      scryfallImageUrl,
      cardId,
      card.name
    )

    if (!storedImageUrl) {
      // Fallback to Scryfall URL if storage fails
      return NextResponse.json(
        { imageUrl: scryfallImageUrl, source: 'scryfall-direct' },
        {
          headers: {
            'Cache-Control': 'public, s-maxage=3600',
          },
        }
      )
    }

    // Update database with cached URL
    await supabase.from('cards').update({ image_url: storedImageUrl }).eq('id', cardId)

    return NextResponse.json(
      { imageUrl: storedImageUrl, source: 'storage-new' },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=31536000, immutable',
        },
      }
    )
  } catch (error) {
    console.error('Unexpected error in card-image API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
}
