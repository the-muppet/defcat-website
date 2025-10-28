'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

// Force dynamic rendering - don't prerender at build time
export const dynamic = 'force-dynamic'

/**
 * Auth Callback Success Page
 * Handles setting the session from URL hash parameters
 */
export default function CallbackSuccessPage() {
  const router = useRouter()

  useEffect(() => {
    const setSession = async () => {
      // Get session data from URL hash
      const hash = window.location.hash.substring(1)
      const params = new URLSearchParams(hash)

      const accessToken = params.get('access_token')
      const refreshToken = params.get('refresh_token')

      if (!accessToken || !refreshToken) {
        console.error('Missing session tokens in URL')
        router.push('/auth/login?error=session_missing')
        return
      }

      const supabase = createClient()

      // Set the session
      const { error } = await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken,
      })

      if (error) {
        console.error('Failed to set session:', error)
        router.push('/auth/login?error=session_failed')
        return
      }

      console.log('✓ Session set successfully')

      // Redirect to decks
      router.push('/decks')
    }

    setSession()
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-muted/20">
      <div className="max-w-md w-full p-8 space-y-6 text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto" />
        <h1 className="text-2xl font-bold">Completing sign-in...</h1>
        <p className="text-muted-foreground">Please wait</p>
      </div>
    </div>
  )
}
