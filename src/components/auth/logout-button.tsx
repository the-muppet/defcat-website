// components/auth/logout-button.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { logout } from '@/app/actions/auth'
import { Button } from '@/components/ui/button'

export function LogoutButton() {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  async function handleLogout() {
    setIsLoading(true)
    await logout()
    router.push('/')
    router.refresh()
  }

  return (
    <Button onClick={handleLogout} disabled={isLoading}>
      {isLoading ? 'Signing out...' : 'Sign Out'}
    </Button>
  )
}