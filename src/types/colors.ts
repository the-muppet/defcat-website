enum ManaSymbol {
  WHITE = 'white',
  BLUE = 'blue',
  BLACK = 'black',
  RED = 'red',
  GREEN = 'green',
  COLORLESS = 'colorless',
}

const ManaColorMap = {
  W: 'oklch(0.90 0.40 100)',
  U: 'oklch(0.35 0.40 270)',
  B: 'oklch(0.32 0.16 330)',
  R: 'oklch(0.35 0.40 50)',
  G: 'oklch(0.40 0.40 150)',
  C: 'oklch(0.5 0 0)',

  // Aliases for convenience
  WHITE: 'oklch(0.90 0.40 100)',
  BLUE: 'oklch(0.35 0.40 270)',
  BLACK: 'oklch(0.32 0.16 333.58)',
  RED: 'oklch(0.35 0.40 50)',
  GREEN: 'oklch(0.40 0.40 150)',
  COLORLESS: 'oklch(0.5 0 0)',
} as const

type ColorInfo = {
  letter: string // Single letter code (W, U, B, R, G, C)
  name: string // Full name
  className: string // Mana Font CSS/icon class name
  color: string // OKLCH color value
}

const ColorMapping: Record<string, ColorInfo> = {
  W: { letter: 'W', name: 'White', className: 'ms ms-w', color: ManaColorMap.W },
  U: { letter: 'U', name: 'Blue', className: 'ms ms-u', color: ManaColorMap.U },
  B: { letter: 'B', name: 'Black', className: 'ms ms-b', color: ManaColorMap.B },
  R: { letter: 'R', name: 'Red', className: 'ms ms-r', color: ManaColorMap.R },
  G: { letter: 'G', name: 'Green', className: 'ms ms-g', color: ManaColorMap.G },
  C: { letter: 'C', name: 'Colorless', className: 'ms ms-c', color: ManaColorMap.C },
}

export const ColorIdentity = {
  // Constants
  ORDER: ['W', 'U', 'B', 'R', 'G', 'C'],

  // Enums
  Symbol: ManaSymbol,

  // Color values
  Colors: ManaColorMap,

  // Convert ManaSymbol enum to letter code
  symbolToLetter: (symbol: ManaSymbol): string => {
    const map: Record<ManaSymbol, string> = {
      [ManaSymbol.WHITE]: 'W',
      [ManaSymbol.BLUE]: 'U',
      [ManaSymbol.BLACK]: 'B',
      [ManaSymbol.RED]: 'R',
      [ManaSymbol.GREEN]: 'G',
      [ManaSymbol.COLORLESS]: 'C',
    }
    return map[symbol]
  },

  // Convert letter code to ManaSymbol enum
  letterToSymbol: (letter: string): ManaSymbol => {
    const map: Record<string, ManaSymbol> = {
      W: ManaSymbol.WHITE,
      U: ManaSymbol.BLUE,
      B: ManaSymbol.BLACK,
      R: ManaSymbol.RED,
      G: ManaSymbol.GREEN,
      C: ManaSymbol.COLORLESS,
    }
    return map[letter.toUpperCase()] || ManaSymbol.COLORLESS
  },

  // Get color value from symbol, letter, or name
  getColorValue: (input: ManaSymbol | string): string => {
    if (Object.values(ManaSymbol).includes(input as ManaSymbol)) {
      const letter = ColorIdentity.symbolToLetter(input as ManaSymbol)
      return ColorMapping[letter].color
    }
    const upper = input.toUpperCase()
    return ColorMapping[upper]?.color || ManaColorMap.C
  },

  // Get ColorInfo from symbol, letter, or name
  getColorInfo: (input: ManaSymbol | string): ColorInfo => {
    if (Object.values(ManaSymbol).includes(input as ManaSymbol)) {
      const letter = ColorIdentity.symbolToLetter(input as ManaSymbol)
      return ColorMapping[letter]
    }
    const upper = input.toUpperCase()
    return ColorMapping[upper] || ColorMapping.C
  },

  /**
   * Extract color letters from a mana cost string
   * "{2}{W}{U}" -> ['W', 'U']
   * "{W/U}" -> ['W', 'U']
   */
  extractColorsFromManaCost: (manaCost: string | null | undefined): string[] => {
    if (!manaCost) return ['C']

    const colors: string[] = []

    // Check for each color (including hybrid mana)
    if (manaCost.includes('W')) colors.push('W')
    if (manaCost.includes('U')) colors.push('U')
    if (manaCost.includes('B')) colors.push('B')
    if (manaCost.includes('R')) colors.push('R')
    if (manaCost.includes('G')) colors.push('G')

    // If no colors found or only generic mana, return colorless
    return colors.length > 0 ? colors : ['C']
  },

  /**
   * Normalize color array to sorted, deduplicated string
   * ['U', 'W', 'W'] -> 'WU'
   */
  normalize: (colors: string[]): string => {
    const unique = [...new Set(colors.map((c) => c.toUpperCase()))]
    return unique
      .sort((a, b) => ColorIdentity.ORDER.indexOf(a) - ColorIdentity.ORDER.indexOf(b))
      .join('')
  },

  /**
   * Compare two color identities for sorting
   */
  compare: (a: string, b: string): number => {
    // Compare by length first (monocolor < multicolor)
    if (a.length !== b.length) return a.length - b.length

    // Then by color order
    for (let i = 0; i < a.length; i++) {
      const aIdx = ColorIdentity.ORDER.indexOf(a[i])
      const bIdx = ColorIdentity.ORDER.indexOf(b[i])
      if (aIdx !== bIdx) return aIdx - bIdx
    }
    return 0
  },

  /**
   * Get icon class for a color identity
   * 'WU' -> 'ms-wu' (Azorius)
   * 'W' -> 'ms-w'
   */
  getClassName: (
    colors: string[] | string,
    cost: boolean = false,
    shadow: boolean = false
  ): string => {
    const normalized = typeof colors === 'string' ? colors : ColorIdentity.normalize(colors)

    const base = `ms ms-${normalized.toLowerCase()}`
    const mods = [cost ? 'ms-cost' : '', shadow ? 'ms-shadow' : ''].filter(Boolean)

    return [base, ...mods].join(' ')
  },

  /**
   * Get individual color letters from a color identity string
   * 'WU' -> ['W', 'U']
   * 'BRG' -> ['B', 'R', 'G']
   */
  getIndividual: (colors: string | null | undefined): string[] => {
    const colorStr = String(colors)
    return colorStr.toUpperCase().split('')
  },

  /**
   * Get human-readable label for color identity
   * 'WU' -> 'White/Blue'
   * 'W' -> 'White'
   */
  getLabel: (colors: string[] | string): string => {
    const normalized = typeof colors === 'string' ? colors : ColorIdentity.normalize(colors)


    // Guild names (two colors)
    const guildNames: Record<string, string> = {
      WU: 'Azorius',
      WB: 'Orzhov',
      RW: 'Boros',
      GW: 'Selesnya',
      UB: 'Dimir',
      UR: 'Izzet',
      BU: 'Simic',
      BR: 'Rakdos',
      BG: 'Golgari',
      RG: 'Gruul',
    }

    // Shard/Wedge names (three colors)
    const triNames: Record<string, string> = {
      WUB: 'Esper',
      WUR: 'Jeskai',
      WUG: 'Bant',
      WBR: 'Mardu',
      WBG: 'Abzan',
      WRG: 'Naya',
      UBR: 'Grixis',
      UBG: 'Sultai',
      URG: 'Temur',
      BRG: 'Jund',
    }

    if (normalized.length === 1) {
      return ColorMapping[normalized]?.name || 'Colorless'
    }

    // Return color names instead of guild/clan names
    return normalized
      .split('')
      .map((c) => ColorMapping[c]?.name)
      .join('/')
  },

  /**
   * Parse mana cost string into individual symbols
   * "{2}{W}{U}" -> ['2', 'w', 'u']
   * "{W/G}" -> ['gw'] (normalized hybrid)
   * "{B/P}" -> ['bp'] (Phyrexian)
   */
  parseManaCost: (manaCost: string): string[] => {
    if (!manaCost || !manaCost.includes('{')) return []

    return manaCost.match(/\{([^}]+)\}/g)?.map((s) => {
      const inner = s.slice(1, -1)
      return ColorIdentity.normalizeHybridMana(inner)
    }) || []
  },

  /**
   * Normalize hybrid mana order per Mana Font conventions
   * "W/G" -> "wg" (W comes before G in WUBRG, so keep order)
   * "G/W" -> "gw" (G comes after W, so G goes first)
   * "W/P" -> "wp" (Phyrexian mana keeps color first)
   *
   * Rule: The color that comes LATER in WUBRG goes FIRST in the class name
   */
  normalizeHybridMana: (symbol: string): string => {
    if (!symbol.includes('/')) return symbol.toLowerCase()

    const [first, second] = symbol.split('/')
    const colorOrder: Record<string, number> = { W: 0, U: 1, B: 2, R: 3, G: 4 }

    if (second === 'P' || first === 'P') {
      return symbol.replace('/', '').toLowerCase()
    }

    const firstOrder = colorOrder[first.toUpperCase()]
    const secondOrder = colorOrder[second.toUpperCase()]

    if (firstOrder !== undefined && secondOrder !== undefined) {
      return secondOrder > firstOrder
        ? `${first}${second}`.toLowerCase()
        : `${second}${first}`.toLowerCase()
    }

    return symbol.replace('/', '').toLowerCase()
  },

  /**
   * Check if a symbol is hybrid mana (2+ color letters)
   * "ub" -> true
   * "wp" -> true (Phyrexian)
   * "w" -> false
   * "2" -> false
   */
  isHybridMana: (symbol: string): boolean => {
    return symbol.length >= 2 && /^[wubrgcp]+$/.test(symbol.toLowerCase())
  },

  /**
   * Check if a symbol is Phyrexian mana (contains P)
   * "wp" -> true
   * "bp" -> true
   * "w" -> false
   */
  isPhyrexianMana: (symbol: string): boolean => {
    return symbol.toLowerCase().includes('p')
  },

  /**
   * Determine if ms-cost class should be applied
   * Only hybrid and Phyrexian mana symbols need ms-cost
   */
  shouldApplyCostClass: (symbol: string): boolean => {
    return ColorIdentity.isHybridMana(symbol) || ColorIdentity.isPhyrexianMana(symbol)
  },
}

// Type exports for external use
export type { ColorInfo }
