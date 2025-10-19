import { createClient } from '@/lib/supabase/client'
import { ManaSymbol } from './svg-mask'

export interface ManaSVGData {
  symbol: ManaSymbol
  path: string
  label: string
  cssColor: string
}

// Get public URLs from Supabase storage
function getSupabaseSVGUrl(filename: string): string {
  const supabase = createClient()
  const { data } = supabase.storage
    .from('media')
    .getPublicUrl(filename)
  
  return data.publicUrl
}

export const MANA_SVG_MAP: Record<ManaSymbol, ManaSVGData> = {
  [ManaSymbol.WHITE]: {
    symbol: ManaSymbol.WHITE,
    path: getSupabaseSVGUrl('w.svg'),
    label: 'White',
    cssColor: 'var(--mana-white)'
  },
  [ManaSymbol.BLUE]: {
    symbol: ManaSymbol.BLUE,
    path: getSupabaseSVGUrl('u.svg'),
    label: 'Blue',
    cssColor: 'var(--mana-blue)'
  },
  [ManaSymbol.BLACK]: {
    symbol: ManaSymbol.BLACK,
    path: getSupabaseSVGUrl('b.svg'),
    label: 'Black',
    cssColor: 'var(--mana-black)'
  },
  [ManaSymbol.RED]: {
    symbol: ManaSymbol.RED,
    path: getSupabaseSVGUrl('r.svg'),
    label: 'Red',
    cssColor: 'var(--mana-red)'
  },
  [ManaSymbol.GREEN]: {
    symbol: ManaSymbol.GREEN,
    path: getSupabaseSVGUrl('g.svg'),
    label: 'Green',
    cssColor: 'var(--mana-green)'
  },
}

// SVG cache for performance
const svgCache = new Map<string, string>()

export async function loadManaSVG(path: string): Promise<string> {
  // Check cache first
  if (svgCache.has(path)) {
    return svgCache.get(path)!
  }

  try {
    // Fetch and cache
    const response = await fetch(path)
    if (!response.ok) {
      throw new Error(`Failed to load SVG from ${path}`)
    }

    const svg = await response.text()
    svgCache.set(path, svg)
    return svg
  } catch (error) {
    console.error(`Error loading SVG from ${path}:`, error)
    throw error
  }
}

// Track if we've already preloaded
let preloaded = false

// Preload all mana SVGs for better performance
export function preloadManaSVGs() {
  if (typeof window === 'undefined' || preloaded) return () => {}

  // Fetch all SVGs to populate cache
  Promise.all(
    Object.values(MANA_SVG_MAP).map(({ path }) => loadManaSVG(path))
  ).catch(console.error)

  preloaded = true
  return () => {
    preloaded = false
  }
}

export function clearSVGCache() {
  svgCache.clear()
}