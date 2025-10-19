
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import type { MoxfieldDeck, DeckStats, CardEntry } from '@/types/moxfield';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function calculateDeckStats(deck: MoxfieldDeck): DeckStats {
  const mainboard = Object.values(deck.boards.mainboard.cards);

  let totalCards = 0;
  let totalCMC = 0;
  const manaCurve: { [cmc: number]: number } = {};
  const typeBreakdown = {
    creatures: 0,
    instants: 0,
    sorceries: 0,
    artifacts: 0,
    enchantments: 0,
    planeswalkers: 0,
    lands: 0,
  };

  mainboard.forEach((entry: CardEntry) => {
    const qty = entry.quantity;
    const cmc = entry.card.cmc;
    const type = entry.card.type_line.toLowerCase();

    totalCards += qty;
    totalCMC += cmc * qty;

    // Mana curve
    manaCurve[cmc] = (manaCurve[cmc] || 0) + qty;

    // Type breakdown
    if (type.includes('creature')) typeBreakdown.creatures += qty;
    if (type.includes('instant')) typeBreakdown.instants += qty;
    if (type.includes('sorcery')) typeBreakdown.sorceries += qty;
    if (type.includes('artifact')) typeBreakdown.artifacts += qty;
    if (type.includes('enchantment')) typeBreakdown.enchantments += qty;
    if (type.includes('planeswalker')) typeBreakdown.planeswalkers += qty;
    if (type.includes('land')) typeBreakdown.lands += qty;
  });

  return {
    totalCards,
    averageCMC: totalCards > 0 ? totalCMC / totalCards : 0,
    colorBreakdown: deck.boards.colorPercentages,
    typeBreakdown,
    manaCurve,
  };
}

export function getColorSymbol(color: string): string {
  const symbols: { [key: string]: string } = {
    W: '⚪',
    U: '🔵',
    B: '⚫',
    R: '🔴',
    G: '🟢',
  };
  return symbols[color] || '';
}

export function formatPrice(price: string | null): string {
  if (!price) return 'N/A';
  const num = parseFloat(price);
  return `$${num.toFixed(2)}`;
}

export function groupCardsByType(cards: { [key: string]: CardEntry }) {
  const groups: { [type: string]: CardEntry[] } = {
    Creatures: [],
    Instants: [],
    Sorceries: [],
    Artifacts: [],
    Enchantments: [],
    Planeswalkers: [],
    Lands: [],
    Other: [],
  };

  Object.values(cards).forEach((entry) => {
    const type = entry.card.type_line.toLowerCase();

    if (type.includes('creature')) groups.Creatures.push(entry);
    else if (type.includes('instant')) groups.Instants.push(entry);
    else if (type.includes('sorcery')) groups.Sorceries.push(entry);
    else if (type.includes('artifact')) groups.Artifacts.push(entry);
    else if (type.includes('enchantment')) groups.Enchantments.push(entry);
    else if (type.includes('planeswalker')) groups.Planeswalkers.push(entry);
    else if (type.includes('land')) groups.Lands.push(entry);
    else groups.Other.push(entry);
  });

  // Remove empty groups
  return Object.fromEntries(
    Object.entries(groups).filter(([_, cards]) => cards.length > 0)
  );
}

export function sortCardsByName(cards: CardEntry[]): CardEntry[] {
  return [...cards].sort((a, b) =>
    a.card.name.localeCompare(b.card.name)
  );
}

/**
 * For server-only auth utilities (getCurrentUser, requireAuth, requireTier),
 * import from '@/lib/server-utils'
 */
