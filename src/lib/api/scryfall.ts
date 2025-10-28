// lib/api/scryfall.ts
interface ScryfallCard {
  id: string
  name: string
  color_identity: string[]
  image_uris?: {
    small: string
    normal: string
    large: string
    png: string
    art_crop: string
    border_crop: string
  }
  card_faces?: Array<{
    name: string
    image_uris?: {
      small: string
      normal: string
      large: string
      png: string
      art_crop: string
      border_crop: string
    }
  }>
}

interface ScryfallError {
  object: 'error'
  code: string
  status: number
  details: string
}

// Cache for card images
const cardImageCache = new Map<string, string>()

/**
 * Fetch card art_crop from Scryfall by exact name
 * @param cardName - Exact card name
 * @returns Promise with art_crop URL or null
 */
export async function fetchCardArt(cardName: string): Promise<string | null> {
  // Validate input
  if (!cardName || typeof cardName !== 'string') {
    console.warn('Invalid card name provided to fetchCardArt:', cardName)
    return null
  }

  // Check cache first
  const cacheKey = cardName.toLowerCase().trim()
  if (cardImageCache.has(cacheKey)) {
    return cardImageCache.get(cacheKey)!
  }

  try {
    // Use exact name search
    const encodedName = encodeURIComponent(cardName)
    const response = await fetch(`https://api.scryfall.com/cards/named?exact=${encodedName}`, {
      headers: {
        Accept: 'application/json',
      },
    })

    if (!response.ok) {
      console.warn(`Scryfall API error for "${cardName}":`, response.status)
      return null
    }

    const data: ScryfallCard | ScryfallError = await response.json()

    if ('object' in data && data.object === 'error') {
      console.warn(`Scryfall error for "${cardName}":`, data.details)
      return null
    }

    const card = data as ScryfallCard

    // Handle double-faced cards
    let artCropUrl: string | null = null

    if (card.image_uris?.art_crop) {
      artCropUrl = card.image_uris.art_crop
    } else if (card.card_faces?.[0]?.image_uris?.art_crop) {
      // For double-faced cards, use the front face
      artCropUrl = card.card_faces[0].image_uris.art_crop
    }

    if (artCropUrl) {
      cardImageCache.set(cacheKey, artCropUrl)
      return artCropUrl
    }

    return null
  } catch (error) {
    console.error(`Error fetching card art for "${cardName}":`, error)
    return null
  }
}

/**
 * Fetch multiple card art_crops with rate limiting
 * @param cardNames - Array of card names
 * @param delayMs - Delay between requests (Scryfall recommends 50-100ms)
 * @returns Promise with map of card names to art_crop URLs
 */
export async function fetchCardArts(
  cardNames: string[],
  delayMs: number = 75
): Promise<Map<string, string>> {
  const results = new Map<string, string>()

  for (const cardName of cardNames) {
    const artCrop = await fetchCardArt(cardName)
    if (artCrop) {
      results.set(cardName, artCrop)
    }

    // Rate limiting - be nice to Scryfall
    if (cardNames.length > 1) {
      await new Promise((resolve) => setTimeout(resolve, delayMs))
    }
  }

  return results
}

/**
 * Clear the card image cache
 */
export function clearCardImageCache() {
  cardImageCache.clear()
}
