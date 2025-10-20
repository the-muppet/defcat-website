// lib/utility/color-identity.ts
import { ColorMapping, COLOR_MAPPINGS } from "@/types/core"

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