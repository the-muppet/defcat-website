// app/decks/[id]/page.tsx
'use client'

import dynamic from 'next/dynamic'
import { useMediaQuery } from '@/lib/hooks/useMediaQuery'

const DesktopDeckDetailPage = dynamic(() => import('./page.desktop'), { ssr: false })
const MobileDeckDetailPage = dynamic(() => import('./page.mobile'), { ssr: false })

interface PageProps {
  params: Promise<{ id: string }>
}

export default function DeckDetailPage({ params }: PageProps) {
  const { isMobile } = useMediaQuery()

  return isMobile ? <MobileDeckDetailPage params={params} /> : <DesktopDeckDetailPage params={params} />
}