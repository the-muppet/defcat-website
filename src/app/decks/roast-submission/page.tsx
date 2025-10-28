'use client'

import { useSearchParams } from 'next/navigation'
import RoastSubmissionForm from '@/components/admin/RoastSubmissionForm'
import { Suspense } from 'react'

function RoastSubmissionContent() {
  const searchParams = useSearchParams()
  const prefilledDeckUrl = searchParams.get('deckUrl')

  return (
    <div className="min-h-screen py-12 px-4">
      <RoastSubmissionForm prefilledDeckUrl={prefilledDeckUrl} />
    </div>
  )
}

export default function RoastSubmissionPage() {
  return (
    <Suspense fallback={<div className="min-h-screen py-12 px-4">Loading...</div>}>
      <RoastSubmissionContent />
    </Suspense>
  )
}
