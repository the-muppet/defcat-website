// lib/hooks/useMediaQuery.ts
'use client'

import { useEffect, useState } from 'react'

interface MediaQueryResult {
  isMobile: boolean
  isTablet: boolean
  isDesktop: boolean
  width: number
}

export function useMediaQuery(): MediaQueryResult {
  const [result, setResult] = useState<MediaQueryResult>({
    isMobile: false,
    isTablet: false,
    isDesktop: true,
    width: 1024,
  })

  useEffect(() => {
    // Check if window is defined (client-side)
    if (typeof window === 'undefined') return

    const handleResize = () => {
      const width = window.innerWidth
      setResult({
        isMobile: width < 768,
        isTablet: width >= 768 && width < 1024,
        isDesktop: width >= 1024,
        width,
      })
    }

    // Initial check
    handleResize()

    // Add event listener
    window.addEventListener('resize', handleResize)

    // Cleanup
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return result
}
