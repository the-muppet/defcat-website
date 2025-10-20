// components/auth/login-button.tsx
'use client'

import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import { LogIn } from 'lucide-react'

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

