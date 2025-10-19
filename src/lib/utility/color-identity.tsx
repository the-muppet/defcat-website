// lib/utility/color-identity.ts

export type ColorMapping = {
  name: string
  className: string
  individual: string[] // For fallback rendering
}

export const COLOR_MAPPINGS: Record<string, ColorMapping> = {
  // Mono-color
  'W': { name: 'White', className: 'ms-w', individual: ['W'] },
  'U': { name: 'Blue', className: 'ms-u', individual: ['U'] },
  'B': { name: 'Black', className: 'ms-b', individual: ['B'] },
  'R': { name: 'Red', className: 'ms-r', individual: ['R'] },
  'G': { name: 'Green', className: 'ms-g', individual: ['G'] },
  'C': { name: 'Colorless', className: 'ms-c', individual: ['C'] },
  
  // 2-color guilds
  'WU': { name: 'Azorius', className: 'ms-guild-azorius', individual: ['W', 'U'] },
  'WB': { name: 'Orzhov', className: 'ms-guild-orzhov', individual: ['W', 'B'] },
  'UB': { name: 'Dimir', className: 'ms-guild-dimir', individual: ['U', 'B'] },
  'UR': { name: 'Izzet', className: 'ms-guild-izzet', individual: ['U', 'R'] },
  'BR': { name: 'Rakdos', className: 'ms-guild-rakdos', individual: ['B', 'R'] },
  'BG': { name: 'Golgari', className: 'ms-guild-golgari', individual: ['B', 'G'] },
  'RG': { name: 'Gruul', className: 'ms-guild-gruul', individual: ['R', 'G'] },
  'RW': { name: 'Boros', className: 'ms-guild-boros', individual: ['R', 'W'] },
  'GW': { name: 'Selesnya', className: 'ms-guild-selesnya', individual: ['G', 'W'] },
  'GU': { name: 'Simic', className: 'ms-guild-simic', individual: ['G', 'U'] },
  
  // 3-color shards
  'WUB': { name: 'Esper', className: 'ms-clan-esper', individual: ['W', 'U', 'B'] },
  'UBR': { name: 'Grixis', className: 'ms-clan-grixis', individual: ['U', 'B', 'R'] },
  'BRG': { name: 'Jund', className: 'ms-clan-jund', individual: ['B', 'R', 'G'] },
  'RGW': { name: 'Naya', className: 'ms-clan-naya', individual: ['R', 'G', 'W'] },
  'GWU': { name: 'Bant', className: 'ms-clan-bant', individual: ['G', 'W', 'U'] },
  
  // 3-color wedges
  'WBG': { name: 'Abzan', className: 'ms-clan-abzan', individual: ['W', 'B', 'G'] },
  'URW': { name: 'Jeskai', className: 'ms-clan-jeskai', individual: ['U', 'R', 'W'] },
  'BRW': { name: 'Mardu', className: 'ms-clan-mardu', individual: ['B', 'R', 'W'] },
  'GUB': { name: 'Sultai', className: 'ms-clan-sultai', individual: ['G', 'U', 'B'] },
  'RGU': { name: 'Temur', className: 'ms-clan-temur', individual: ['R', 'G', 'U'] },
  
  // 4-color
  'UBRG': { name: 'No White', className: 'ms-ci-ubrg', individual: ['U', 'B', 'R', 'G'] },
  'BRGW': { name: 'No Blue', className: 'ms-ci-brgw', individual: ['B', 'R', 'G', 'W'] },
  'RGWU': { name: 'No Black', className: 'ms-ci-rgwu', individual: ['R', 'G', 'W', 'U'] },
  'GWUB': { name: 'No Red', className: 'ms-ci-gwub', individual: ['G', 'W', 'U', 'B'] },
  'WUBR': { name: 'No Green', className: 'ms-ci-wubr', individual: ['W', 'U', 'B', 'R'] },
  
  // 5-color
  'WUBRG': { name: 'Five Color', className: 'watermark-colorpie', individual: ['W', 'U', 'B', 'R', 'G'] },
}

export class ColorIdentity {
  private static readonly ORDER = 'WUBRGC'

  /**
   * Normalize color identity to WUBRG order
   */
  static normalize(colorIdentity: string | string[]): string {
    const colors = typeof colorIdentity === "string"
      ? colorIdentity.split('')
      : colorIdentity

    return colors
      .map(c => c.toUpperCase())
      .filter(c => this.ORDER.includes(c))
      .sort((a, b) => this.ORDER.indexOf(a) - this.ORDER.indexOf(b))
      .join('')
  }

  /**
   * Get the full color mapping object (use sparingly)
   */
  static getMapping(colorIdentity: string | string[]): ColorMapping | null {
    const normalized = this.normalize(colorIdentity)
    return COLOR_MAPPINGS[normalized] || null
  }

  /**
   * Get color identity CSS class name
   */
  static getClassName(colorIdentity: string | string[]): string {
    const normalized = this.normalize(colorIdentity)
    return COLOR_MAPPINGS[normalized]?.className || 'ms-c'
  }

  /**
   * Get color identity name (e.g., "Azorius", "White")
   */
  static getName(colorIdentity: string | string[]): string {
    const normalized = this.normalize(colorIdentity)
    return COLOR_MAPPINGS[normalized]?.name || 'Unknown'
  }

  /**
   * Get individual color symbols for fallback rendering
   */
  static getIndividual(colorIdentity: string | string[]): string[] {
    const normalized = this.normalize(colorIdentity)
    return COLOR_MAPPINGS[normalized]?.individual || []
  }
}