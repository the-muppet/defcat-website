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
  B: 'oklch(0.30 0.40 335)',
  R: 'oklch(0.35 0.40 50)',
  G: 'oklch(0.40 0.40 150)',
  C: 'oklch(0.5 0 0)',

  // Aliases for convenience
  WHITE: 'oklch(0.90 0.40 100)',
  BLUE: 'oklch(0.35 0.40 270)',
  BLACK: 'oklch(0.30 0.40 335)',
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

    const base = `ms-${normalized.toLowerCase()}`
    const mods = [cost ? 'ms-cost' : '', shadow ? 'ms-shadow' : ''].filter(Boolean)

    return [base, ...mods].join(' ')
  },

  /**
   * Get human-readable label for color identity
   * 'WU' -> 'Azorius' or 'White/Blue'
   * 'W' -> 'White'
   */
  getLabel: (colors: string[] | string): string => {
    const normalized = typeof colors === 'string' ? colors : ColorIdentity.normalize(colors)

    // Guild names (two colors)
    const guildNames: Record<string, string> = {
      WU: 'Azorius',
      WB: 'Orzhov',
      WR: 'Boros',
      WG: 'Selesnya',
      UB: 'Dimir',
      UR: 'Izzet',
      UG: 'Simic',
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

    if (normalized.length === 2 && guildNames[normalized]) {
      return guildNames[normalized]
    }

    if (normalized.length === 3 && triNames[normalized]) {
      return triNames[normalized]
    }

    // Fallback to color names
    return normalized
      .split('')
      .map((c) => ColorMapping[c]?.name)
      .join('/')
  },
}

// Type exports for external use
export type { ColorInfo }
