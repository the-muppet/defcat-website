/**
 * Individual Deck Detail Page
 */

'use client';

import React, { use, useEffect, useState } from 'react';
import { useDeck } from '@/lib/hooks/useDecks';
import { createClient } from '@/lib/supabase/client';
import { ExternalLink, Eye, Heart, Calendar, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ManaSymbol } from '@/components/decks/ManaSymbols';

interface PageProps {
  params: Promise<{ id: string }>;
}

interface DeckCard {
  quantity: number;
  board_type: string;
  cards: {
    name: string;
    mana_cost: string | null;
    type_line: string | null;
    cmc: number | null;
    image_url: string | null;
  } | null;
}

// Helper component to render mana costs using Mana font
function ManaCost({ cost }: { cost: string }) {
  // Parse mana cost string like "{2}{U}{B}" into individual symbols
  const symbols = cost.match(/\{[^}]+\}/g) || [];
  
  const getSymbolClass = (symbol: string): string => {
    // Remove curly braces
    const clean = symbol.replace(/[{}]/g, '').toLowerCase();
    
    // Handle hybrid mana (e.g., {W/U})
    if (clean.includes('/')) {
      const colors = clean.split('/').join('');
      return `ms-${colors}`;
    }
    
    // Handle Phyrexian mana (e.g., {U/P})
    if (clean.includes('p')) {
      const color = clean.replace('/p', '').replace('p', '');
      return `ms-${color}p`;
    }
    
    // Handle generic numbers
    if (!isNaN(Number(clean))) {
      return `ms-${clean}`;
    }
    
    // Handle regular mana symbols (W, U, B, R, G, C)
    return `ms-${clean}`;
  };
  
  return (
    <span className="inline-flex items-center gap-0.5">
      {symbols.map((symbol, idx) => (
        <i key={idx} className={`ms ${getSymbolClass(symbol)} ms-cost ms-shadow`} />
      ))}
    </span>
  );
}

export default function DeckDetailPage({ params }: PageProps) {
  const { id } = use(params);
  const { data: deck, isLoading, error } = useDeck(id);
  const [deckCards, setDeckCards] = useState<DeckCard[]>([]);
  const [cardsLoading, setCardsLoading] = useState(true);

  useEffect(() => {
    if (!deck?.id) {
      setCardsLoading(false);
      return;
    }

    async function fetchDeckCards() {
      try {
        const supabase = createClient();
        const { data, error } = await supabase
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
          .eq('deck_id', deck!.id)
          .eq('board_type', 'mainboard');

        if (error) {
          console.error('Error fetching deck cards:', error);
          setDeckCards([]);
        } else {
          setDeckCards((data as any) || []);
        }
      } catch (err) {
        console.error('Error fetching deck cards:', err);
        setDeckCards([]);
      } finally {
        setCardsLoading(false);
      }
    }

    fetchDeckCards();
  }, [deck?.id]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary/20 border-t-primary mx-auto mb-4" />
            <div className="absolute inset-0 animate-pulse rounded-full h-16 w-16 border-4 border-primary/10 mx-auto" />
          </div>
          <p className="text-muted-foreground font-medium">Loading deck...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-destructive/5">
        <div className="text-center max-w-md">
          <div className="bg-destructive/10 rounded-full p-4 inline-block mb-4">
            <div className="text-destructive text-4xl">⚠</div>
          </div>
          <p className="text-destructive text-lg font-semibold mb-2">
            {error?.message || 'Failed to load deck'}
          </p>
          <p className="text-muted-foreground mb-6">Something went wrong while loading this deck.</p>
          <Button asChild size="lg" className="shadow-lg">
            <Link href="/decks">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Decks
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  if (!deck) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Back Button */}
        <Button asChild variant="ghost" className="mb-6 hover:bg-accent">
          <Link href="/decks">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Decks
          </Link>
        </Button>

        {/* Hero Section - Deck Header */}
        <div className="bg-card border border-border rounded-xl overflow-hidden mb-8 shadow-lg">
          {/* Top section with gradient background */}
          <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-8 border-b border-border">
            <div className="flex items-start justify-between gap-6">
              <div className="flex-1">
                <h1 className="text-4xl md:text-5xl font-bold mb-3 text-foreground">{deck.name}</h1>
                
                {/* Commanders */}
                <div className="flex flex-wrap gap-2">
                  {deck.commanders?.map((cmd, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center px-3 py-1.5 rounded-lg bg-primary/15 text-primary border border-primary/30 font-medium text-sm hover:bg-primary/25 transition-colors"
                    >
                      {cmd}
                    </span>
                  ))}
                </div>
              </div>
              
              {deck.color_identity && deck.color_identity.length > 0 && (
                <div className="flex-shrink-0 bg-background/50 rounded-lg p-3 border border-border">
                  <div className="flex items-center gap-1">
                    {(deck.color_identity || []).map((color, idx) => (
                      <i key={idx} className={`ms ms-${color.toLowerCase()} ms-cost ms-shadow ms-2x`} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="p-8">
            {/* Description */}
            {deck.description && (
              <p className="text-muted-foreground text-lg mb-6 leading-relaxed">
                {deck.description}
              </p>
            )}

            {/* Stats Row */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-accent/50 rounded-lg p-4 border border-border hover:bg-accent transition-colors">
                <div className="flex items-center gap-2 mb-1">
                  <Eye className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Views</span>
                </div>
                <div className="text-3xl font-bold text-foreground">
                  {deck.view_count?.toLocaleString() || 0}
                </div>
              </div>

              <div className="bg-accent/50 rounded-lg p-4 border border-border hover:bg-accent transition-colors">
                <div className="flex items-center gap-2 mb-1">
                  <Heart className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Likes</span>
                </div>
                <div className="text-3xl font-bold text-foreground">
                  {deck.like_count?.toLocaleString() || 0}
                </div>
              </div>

              <div className="bg-accent/50 rounded-lg p-4 border border-border hover:bg-accent transition-colors">
                <div className="flex items-center gap-2 mb-1">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Updated</span>
                </div>
                <div className="text-lg font-semibold text-foreground">
                  {deck.updated_at ? new Date(deck.updated_at).toLocaleDateString() : 'N/A'}
                </div>
              </div>
            </div>

            {/* Action Button */}
            {deck.moxfield_url && (
              <Button asChild size="lg" className="w-full">
                <a
                  href={deck.moxfield_url || '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2"
                >
                  View on Moxfield
                  <ExternalLink className="h-4 w-4" />
                </a>
              </Button>
            )}
          </div>
        </div>

        {/* Decklist Section */}
        <div className="bg-card border border-border rounded-xl shadow-lg overflow-hidden">
          {/* Header */}
          <div className="border-b border-border bg-accent/30 px-8 py-6">
            <div className="flex items-center justify-between">
              <h2 className="text-3xl font-bold text-foreground">Decklist</h2>
              {deckCards.length > 0 && (
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold text-foreground">
                      {deckCards.reduce((sum, dc) => sum + dc.quantity, 0)}
                    </span>
                    <span className="text-muted-foreground">total</span>
                  </div>
                  <div className="w-px h-6 bg-border" />
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold text-foreground">
                      {deckCards.length}
                    </span>
                    <span className="text-muted-foreground">unique</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Content */}
          <div className="p-8">
            {cardsLoading ? (
              <div className="text-center py-16">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
                <p className="text-muted-foreground">Loading cards...</p>
              </div>
            ) : deckCards.length > 0 ? (
              <div className="space-y-10">
                {['Creature', 'Instant', 'Sorcery', 'Artifact', 'Enchantment', 'Planeswalker', 'Land'].map((type) => {
                  const typeCards = deckCards.filter(dc => dc.cards?.type_line?.includes(type));
                  if (typeCards.length === 0) return null;

                  return (
                    <div key={type}>
                      {/* Type Header */}
                      <div className="flex items-center justify-between mb-4 pb-2 border-b border-border">
                        <h3 className="text-2xl font-bold text-foreground">{type}s</h3>
                        <span className="text-sm font-semibold text-muted-foreground">
                          {typeCards.reduce((sum, dc) => sum + dc.quantity, 0)} cards
                        </span>
                      </div>

                      {/* Cards Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-2">
                        {typeCards.map((dc, idx) => (
                          <div 
                            key={idx} 
                            className="flex items-center gap-3 px-3 py-2.5 rounded-md hover:bg-accent transition-colors group"
                          >
                            <span className="font-mono text-muted-foreground text-sm w-8 flex-shrink-0">
                              {dc.quantity}×
                            </span>
                            <span className="flex-1 text-foreground font-medium group-hover:text-primary transition-colors">
                              {dc.cards?.name}
                            </span>
                            {dc.cards?.mana_cost && (
                              <div className="flex-shrink-0">
                                <ManaCost cost={dc.cards.mana_cost} />
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-16 text-center">
                <div className="mb-4">
                  <ExternalLink className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                </div>
                <p className="text-lg font-semibold text-foreground mb-2">
                  Decklist Not Available
                </p>
                <p className="text-muted-foreground mb-6">
                  The full card list hasn't been loaded yet.
                </p>
                {deck.moxfield_url && (
                  <Button asChild size="lg">
                    <a
                      href={deck.moxfield_url || '#'}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      View on Moxfield
                    </a>
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}