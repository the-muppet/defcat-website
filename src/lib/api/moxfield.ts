// Utility to auto-detect Moxfield version

/**
 * Fetches the current Moxfield version from their homepage
 * Call this periodically or when requests start failing
 */
export async function getMoxfieldVersion(): Promise<string> {
  try {
    const response = await fetch('https://moxfield.com', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    })

    const html = await response.text()

    // Look for version in HTML
    // Pattern: "2025.10.13.2" or similar
    const versionMatch = html.match(/["'](\d{4}\.\d{1,2}\.\d{1,2}\.\d+)["']/)

    if (versionMatch) {
      console.log(`Detected Moxfield version: ${versionMatch[1]}`)
      return versionMatch[1]
    }

    // Fallback: try to extract from JavaScript chunks
    const scriptMatch = html.match(/<script.*?src="([^"]+main[^"]+\.js)".*?>/)
    if (scriptMatch) {
      const scriptUrl = scriptMatch[1].startsWith('http')
        ? scriptMatch[1]
        : `https://moxfield.com${scriptMatch[1]}`

      const scriptResponse = await fetch(scriptUrl)
      const scriptText = await scriptResponse.text()

      const scriptVersionMatch = scriptText.match(/["'](\d{4}\.\d{1,2}\.\d{1,2}\.\d+)["']/)
      if (scriptVersionMatch) {
        console.log(`Detected Moxfield version from script: ${scriptVersionMatch[1]}`)
        return scriptVersionMatch[1]
      }
    }

    throw new Error('Could not detect Moxfield version')
  } catch (error) {
    console.error('Error detecting Moxfield version:', error)
    // Return fallback version
    return '2025.10.13.2'
  }
}

/**
 * Cache the version for 24 hours
 */
let cachedVersion: string | null = null
let cacheTimestamp: number = 0
const CACHE_DURATION = 24 * 60 * 60 * 1000 // 24 hours

export async function getCachedMoxfieldVersion(): Promise<string> {
  const now = Date.now()

  if (cachedVersion && now - cacheTimestamp < CACHE_DURATION) {
    return cachedVersion
  }

  cachedVersion = await getMoxfieldVersion()
  cacheTimestamp = now

  return cachedVersion
}

/**
 * Hardcoded fallback - update manually if auto-detection fails
 */
export const FALLBACK_MOXFIELD_VERSION = '2025.10.13.2'
