'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { ShineBorder } from '@/components/ui/shine-border'

// Force dynamic rendering - don't prerender at build time
export const dynamic = 'force-dynamic'

/**
 * Auth Verification Page
 * Handles client-side OTP verification after Patreon OAuth callback
 */
function VerifyContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const verifyToken = async () => {
      const tokenHash = searchParams.get('token_hash')
      const type = searchParams.get('type') || 'magiclink'

      if (!tokenHash) {
        setStatus('error')
        setError('Missing verification token')
        return
      }

      try {
        const supabase = createClient()

        console.log('Attempting to verify OTP with:', {
          type,
          tokenHash: tokenHash.substring(0, 10) + '...',
        })

        // Verify the OTP token to create the session
        const { data, error: verifyError } = await supabase.auth.verifyOtp({
          type: type as any,
          token_hash: tokenHash,
        })

        if (verifyError) {
          console.error('Verification error:', verifyError)
          setStatus('error')
          setError(verifyError.message || 'Verification failed')
          return
        }

        if (!data.session) {
          console.error('No session created after verification')
          setStatus('error')
          setError('Failed to create session')
          return
        }

        console.log('✓ Session created successfully:', data.session.user.email)

        // Success! Redirect to decks page
        setStatus('success')
        setTimeout(() => {
          router.push('/decks')
        }, 1000)
      } catch (err) {
        console.error('Unexpected error:', err)
        setStatus('error')
        setError(err instanceof Error ? err.message : 'Unknown error')
      }
    }

    verifyToken()
  }, [searchParams, router])

  return (
    <>
      <ShineBorder
        borderWidth={2}
        duration={160}
        shineColor={
          'linear-gradient(var(--some-color)0%, var(--some-color)35%, var(--some-color)70%, var(--some-color)100%)'
        }
        className={
          'min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-muted/20'
        }
      />
      <div className="max-w-md w-full p-8 space-y-6 text-center">
        {status === 'verifying' && (
          <>
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto" />
            <h1 className="text-2xl font-bold">Verifying your account...</h1>
            <p className="text-muted-foreground">Please wait while we log you in</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="text-6xl mb-4">✅</div>
            <h1 className="text-2xl font-bold text-green-600">Success!</h1>
            <p className="text-muted-foreground">Redirecting you to your decks...</p>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="text-6xl mb-4">❌</div>
            <h1 className="text-2xl font-bold text-destructive">Verification Failed</h1>
            <p className="text-muted-foreground">{error || 'Unknown error occurred'}</p>
            <button
              onClick={() => router.push('/auth/login')}
              className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90"
            >
              Back to Login
            </button>
          </>
        )}
      </div>
    </>
  )
}

export default function VerifyPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-muted/20">
          <div className="max-w-md w-full p-8 space-y-6 text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto" />
            <h1 className="text-2xl font-bold">Loading...</h1>
          </div>
        </div>
      }
    >
      <VerifyContent />
    </Suspense>
  )
}
