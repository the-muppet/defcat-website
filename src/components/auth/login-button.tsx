// components/auth/login-button.tsx
'use client'

import { LogIn } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'

export function LoginButton({ variant = 'default' }: { variant?: 'default' | 'outline' }) {
  const router = useRouter()

  return (
    <Button
      onClick={() => router.push('/auth/login')}
      variant={variant}
      className={variant === 'default' ? 'btn-tinted-primary' : 'btn-tinted'}
    >
      <LogIn className="h-4 w-4 mr-2" />
      Login
    </Button>
  )
}
