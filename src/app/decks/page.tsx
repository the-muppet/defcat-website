'use client'

import dynamic from 'next/dynamic'
import { useMediaQuery } from '@/lib/hooks/useMediaQuery'

const DesktopDecksPage = dynamic(() => import('./page.desktop'), { ssr: false })
const MobileDecksPage = dynamic(() => import('./page.mobile'), { ssr: false })

export default function DecksPage() {
  const { isMobile } = useMediaQuery()

  return isMobile ? <MobileDecksPage /> : <DesktopDecksPage />
}
