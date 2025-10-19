import { useState } from "react";
import { ManaCost } from "@/components/decks/ManaSymbols"
import { DeckCard } from "@/types/core";


export function CardPreview({ card, quantity }: { card: DeckCard['cards'], quantity: number }) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div 
      className="relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-accent/50 transition-all cursor-pointer group border border-transparent hover:border-border">
        <span className="font-mono text-muted-foreground text-sm w-8 flex-shrink-0 font-semibold">
          {quantity}×
        </span>
        <span className="flex-1 text-foreground font-medium group-hover:text-primary transition-colors">
          {card?.name}
        </span>
        {card?.mana_cost && (
          <div className="flex-shrink-0">
            <ManaCost cost={card.mana_cost} />
          </div>
        )}
      </div>

      {/* Card Image Preview on Hover */}
      {isHovered && card?.image_url && (
        <div className="absolute left-full top-0 ml-4 pointer-events-none">
          <div className="bg-card border-2 border-primary rounded-xl overflow-hidden shadow-2xl">
            <img 
              src={card.image_url} 
              alt={card.name}
              className="w-64 h-auto"
            />
          </div>
        </div>
      )}
    </div>
  );
}