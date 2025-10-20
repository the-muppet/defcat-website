// app/auth/login/page.tsx
/**
 * Login Page with accessible tinted styling
 */

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Sparkles } from 'lucide-react'

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ redirectTo?: string }>
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Redirect if already logged in
  if (user) {
    const params = await searchParams
    redirect(params.redirectTo || '/decks')
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative">
      {/* Subtle tinted background gradient */}
      <div 
        className="absolute inset-0 bg-gradient-to-br from-bg-tinted via-transparent to-bg-tinted opacity-50"
      />
      
      <Card className="w-full max-w-md glass-tinted border-tinted shadow-tinted-xl relative">
        <CardHeader className="space-y-1">
          <div className="flex justify-center mb-4">
            <div className="p-3 rounded-full bg-accent-tinted border border-tinted">
              <Sparkles className="h-8 w-8" style={{ color: 'var(--mana-color)' }} />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-center text-foreground">
            Welcome to DeckVault
          </CardTitle>
          <CardDescription className="text-center text-muted-foreground">
            Sign in with Patreon to access premium decklists
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action="/auth/patreon" method="POST">
            <Button type="submit" className="w-full btn-tinted-primary" size="lg">
              <svg
                className="mr-2 h-5 w-5"
                fill="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M15.386.524c-4.764 0-8.64 3.876-8.64 8.64 0 4.75 3.876 8.613 8.64 8.613 4.75 0 8.614-3.864 8.614-8.613C24 4.4 20.136.524 15.386.524M.003 23.537h4.22V.524H.003" />
              </svg>
              Continue with Patreon
            </Button>
          </form>
          
          <div className="mt-6 space-y-4">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-tinted" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  Benefits include
                </span>
              </div>
            </div>
            
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: 'var(--mana-color)' }} />
                Access to exclusive cEDH decklists
              </li>
              <li className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: 'var(--mana-color)' }} />
                Tier-based content unlocks
              </li>
              <li className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: 'var(--mana-color)' }} />
                Support DefCat's content creation
              </li>
            </ul>
          </div>
          
          <p className="mt-6 text-xs text-center text-muted-foreground">
            By continuing, you agree to our Terms of Service and Privacy Policy
          </p>
        </CardContent>
      </Card>
    </div>
  )
}