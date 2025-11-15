// components/decks/detail/DeckHeader.tsx
/** biome-ignore-all lint/performance/noImgElement: <explanation> */
/** biome-ignore-all lint/suspicious/noArrayIndexKey: <explanation> */
import { GlowingEffect } from '@/components/ui/glowEffect'
import type { Deck, DeckInfo, DecklistCardWithCard } from '@/types'

interface DeckHeaderProps {
  deck: Deck & Partial<DeckInfo>
  cards: DecklistCardWithCard[]
}

export function DeckHeader({ deck, cards }: DeckHeaderProps) {
  const commanderCards = cards.filter((dc) => dc.board === 'commanders')
  
  const getCardImageUrl = (card: any, artCrop = false) => {
    if (!artCrop && card?.cached_image_url) return card.cached_image_url
    if (card?.scryfall_id) {
      const imageType = artCrop ? 'art_crop/front' : 'normal/front'
      return `https://cards.scryfall.io/${imageType}/${card.scryfall_id[0]}/${card.scryfall_id[1]}/${card.scryfall_id}.jpg`
    }
    return null
  }

  const commanderImageUrls = commanderCards
    .map((cmd) => getCardImageUrl(cmd.cards, true))
    .filter(Boolean) as string[]

  return (
    <div className="relative">
      {/* Glow effect layer - absolutely positioned, doesn't affect layout */}
      <div className="absolute inset-[-3px] pointer-events-none">
        <GlowingEffect
          blur={0}
          borderWidth={3}
          spread={80}
          glow={true}
          disabled={false}
          proximity={64}
          inactiveZone={0.01}
        />
      </div>
      
      {/* Actual content card */}
      <div className="relative bg-card border-3 border-border rounded-2xl shadow-xl">
        {/* Gradient Header */}
        <div className="relative bg-gradient-to-br from-primary/20 via-primary/10 to-transparent p-8 border-b border-border">
          {commanderImageUrls.length > 0 && (
            <div className="absolute inset-0 flex items-center justify-center">
              {commanderImageUrls.map((url, idx) => (
                <img
                  key={idx}
                  src={url}
                  alt={`Commander ${idx + 1}`}
                  className="h-full w-full object-cover"
                />
              ))}
            </div>
          )}
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

          <div className="relative">
            {/* Color Identity Badge */}
            {deck.raw_data?.colorIdentity && deck.raw_data.colorIdentity.length > 0 && (
              <div className="inline-flex items-center gap-1.5 bg-black/60 backdrop-blur-sm rounded-full px-4 py-2 mb-4 border border-white/20 shadow-lg">
                {(deck.raw_data.colorIdentity || []).map((color, idx) => (
                  <i key={idx} className={`ms ms-${color.toLowerCase()} ms-2x`} />
                ))}
              </div>
            )}

            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-white tracking-tight drop-shadow-lg">
              {deck.event_date_std && (
                <span className="text-2xl md:text-3xl text-white/80 font-medium mr-3">
                  {deck.event_date_std}
                </span>
              )}
              {deck.author_username && (
                <span className="text-primary/90">{deck.author_username}</span>
              )}
              {deck.deck_title && deck.deck_title !== 'Custom Deck' && (
                <span className="block text-3xl md:text-4xl mt-2 text-white/90">
                  {deck.deck_title}
                </span>
              )}
            </h1>

            {/* Commanders */}
            <div className="flex flex-wrap gap-2">
              {commanderCards.map((cmd, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center px-4 py-2 rounded-full bg-black/40 text-white border border-white/30 font-semibold text-sm hover:bg-black/50 transition-all shadow-lg backdrop-blur-sm"
                >
                  {cmd.cards?.name || cmd.card_name}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Description */}
        {deck.raw_data?.authors && (
          <div className="p-8 border-b border-border bg-accent/20">
            <p className="text-muted-foreground text-lg leading-relaxed">
              {deck.raw_data?.description}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}