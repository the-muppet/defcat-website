// components/layout/header.tsx
'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { User } from '@supabase/supabase-js'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { LogIn, LogOut, Sparkles, ClipboardList } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { PatreonTier } from '@/types/core'
import { useSubmissionEligibility } from '@/lib/hooks/useSubmissionEligibility'
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from '@/components/ui/navigation-menu'
import { AnimatedThemeToggler } from '../ui/animated-theme-toggler'
import { ThemeAnimationType } from '@/lib/hooks/useModeAnimation'
import { AuthLoadingModal } from '@/components/auth/auth-loading-modal'
import { UserMenu } from '@/components/profile/UserMenu'
import { cn } from '@/lib/utils'

export function Header() {
  const [user, setUser] = useState<User | null>(null)
  const [userTier, setUserTier] = useState<PatreonTier>('Citizen')
  const [userRole, setUserRole] = useState<string>('user')
  const [loading, setLoading] = useState(true)
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [showLogoutModal, setShowLogoutModal] = useState(false)
  const [pendingCount, setPendingCount] = useState<number>(0)
  const [showBadge, setShowBadge] = useState(true)
  const pathname = usePathname()
  const supabase = createClient()
  const { isEligible, remainingSubmissions, isLoading: submissionLoading } = useSubmissionEligibility()

  useEffect(() => {
    // Get initial session
    const getUser = async () => {
      try {
        const {
          data: { user },
          error,
        } = await supabase.auth.getUser()

        if (error) {
          console.warn('Auth not configured yet:', error.message)
          setUser(null)
        } else {
          setUser(user)

          // Fetch user profile to get tier and role
          if (user) {
            const { data: profile } = await supabase
              .from('profiles')
              .select('patreon_tier, role')
              .eq('id', user.id)
              .single()

            if (profile) {
              setUserTier((profile.patreon_tier as PatreonTier) || 'Citizen')
              setUserRole(profile.role || 'user')

              // Fetch pending submissions count for admins and developers only
              if (['admin', 'developer'].includes(profile.role || 'user')) {
                const { count } = await supabase
                  .from('deck_submissions')
                  .select('*', { count: 'exact', head: true })
                  .in('status', ['pending', 'queued'])

                setPendingCount(count || 0)

                // For developers, check localStorage preference
                if (profile.role === 'developer') {
                  const stored = localStorage.getItem('show-submission-badge')
                  setShowBadge(stored === null || stored === 'true')
                }
              }
            }
          }
        }
      } catch (error) {
        console.warn('Auth error:', error)
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    getUser()

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [supabase.auth])

  // Listen for notification badge toggle events (developer only)
  useEffect(() => {
    const handleToggle = () => {
      if (userRole === 'developer') {
        const stored = localStorage.getItem('show-submission-badge')
        setShowBadge(stored === null || stored === 'true')
      }
    }

    window.addEventListener('submission-badge-toggle', handleToggle)
    return () => window.removeEventListener('submission-badge-toggle', handleToggle)
  }, [userRole])

  const handleLogin = useCallback(() => {
    setShowLoginModal(true)
    // Small delay for animation, then redirect
    setTimeout(() => {
      window.location.href = '/auth/login'
    }, 300)
  }, [])

  const handleLogout = useCallback(async () => {
    setShowLogoutModal(true)
    try {
      await supabase.auth.signOut()
      // Redirect to home after logout - shorter delay for better UX
      setTimeout(() => {
        setShowLogoutModal(false)
        window.location.href = '/'
      }, 300)
    } catch (error) {
      console.error('Logout error:', error)
      setShowLogoutModal(false)
      // Still redirect even if there's an error
      window.location.href = '/'
    }
  }, [supabase.auth])

  return (
    <>
      <AuthLoadingModal isOpen={showLoginModal} type="login" />
      <AuthLoadingModal isOpen={showLogoutModal} type="logout" />

      <header className="sticky top-0 w-full glass-tinted-strong shadow-tinted-lg z-50">
        <div className="px-8 md:px-16 lg:px-24 flex h-16 items-center justify-between">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center space-x-2 group hover-tinted rounded-lg px-3 py-2 -ml-3 flex-shrink-0"
          >
            <Sparkles className="h-5 w-5 text-tinted transition-transform group-hover:rotate-12 group-hover:scale-110" />
            <span className="font-bold text-xl gradient-tinted-text">DefCat's DeckVault</span>
          </Link>

          {/* Navigation Menu - centered with equal spacing */}
          <div className="absolute left-1/2 -translate-x-1/2">
            <NavigationMenu className="hidden md:flex">
              <NavigationMenuList>
                <NavigationMenuItem>
                  <NavigationMenuLink asChild>
                    <Link
                      href="/decks"
                      className={cn(
                        navigationMenuTriggerStyle(),
                        'hover-tinted',
                        pathname === '/decks' && 'tinted-accent border border-tinted'
                      )}
                    >
                      The Vault
                    </Link>
                  </NavigationMenuLink>
                </NavigationMenuItem>

                <NavigationMenuItem>
                  <NavigationMenuLink asChild>
                    <Link
                      href="/pivot/home"
                      className={cn(
                        navigationMenuTriggerStyle(),
                        'hover-tinted',
                        pathname === '/pivot/home' && 'tinted-accent border border-tinted'
                      )}
                    >
                      Home
                    </Link>
                  </NavigationMenuLink>
                </NavigationMenuItem>

                <NavigationMenuItem>
                  <NavigationMenuLink asChild>
                    <Link
                      href="/pivot/college"
                      className={cn(
                        navigationMenuTriggerStyle(),
                        'hover-tinted',
                        pathname === '/pivot/college' && 'tinted-accent border border-tinted'
                      )}
                    >
                      College
                    </Link>
                  </NavigationMenuLink>
                </NavigationMenuItem>

                <NavigationMenuItem>
                  <NavigationMenuLink asChild>
                    <Link
                      href="/pivot/store"
                      className={cn(
                        navigationMenuTriggerStyle(),
                        'hover-tinted',
                        pathname === '/pivot/store' && 'tinted-accent border border-tinted'
                      )}
                    >
                      Store
                    </Link>
                  </NavigationMenuLink>
                </NavigationMenuItem>

                <NavigationMenuItem>
                  <NavigationMenuLink asChild>
                    <Link
                      href="/about"
                      className={cn(
                        navigationMenuTriggerStyle(),
                        'hover-tinted',
                        pathname === '/about' && 'tinted-accent border border-tinted'
                      )}
                    >
                      About
                    </Link>
                  </NavigationMenuLink>
                </NavigationMenuItem>

                {/* Show Submit Deck for Duke+ tier or admins/mods */}
                {(['Duke', 'Wizard', 'ArchMage'].includes(userTier) ||
                  ['admin', 'moderator', 'developer'].includes(userRole)) && (
                  <NavigationMenuItem>
                    <NavigationMenuLink asChild>
                      <Link
                        href="/decks/submission"
                        className={cn(
                          navigationMenuTriggerStyle(),
                          'hover-tinted',
                          pathname === '/decks/submission' && 'tinted-accent border border-tinted'
                        )}
                      >
                        Submit Deck
                      </Link>
                    </NavigationMenuLink>
                  </NavigationMenuItem>
                )}
              </NavigationMenuList>
            </NavigationMenu>
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center gap-3">
            {/* Theme Toggle */}
            <AnimatedThemeToggler
              animationType={ThemeAnimationType.MANA}
              duration={1000}
              blurAmount={0}
              className="hover-tinted rounded-full p-2"
            />
            {/* User Section */}
            {loading ? (
              <div className="h-10 w-10 rounded-full tinted-accent shimmer-tinted" />
            ) : user ? (
              <div className="flex items-center gap-2">
                {/* Admin/Developer notification badge */}
                {pendingCount > 0 &&
                  (userRole === 'admin' || (userRole === 'developer' && showBadge)) && (
                    <Link
                      href="/admin/submissions"
                      className="relative hover-tinted rounded-lg p-2 transition-all"
                      title={`${pendingCount} pending submission${pendingCount !== 1 ? 's' : ''}`}
                    >
                      <ClipboardList className="h-5 w-5" style={{ color: 'var(--mana-color)' }} />
                      <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                        {pendingCount}
                      </span>
                    </Link>
                  )}
                {/* Deck submission credit indicator */}
                {!submissionLoading && isEligible && remainingSubmissions > 0 && (
                  <Link
                    href="/decks/submission"
                    className="relative hover-tinted rounded-lg p-2 transition-all"
                    title={`${remainingSubmissions} deck submission${remainingSubmissions !== 1 ? 's' : ''} remaining`}
                  >
                    <Sparkles className="h-5 w-5" style={{ color: 'var(--mana-color)' }} />
                    <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white">
                      {remainingSubmissions}
                    </span>
                  </Link>
                )}
                <div className="hover-tinted rounded-full">
                  <UserMenu
                    user={{
                      id: user.id,
                      email: user.email || '',
                      patreonTier: userTier,
                      role: userRole as any,
                    }}
                  />
                </div>
              </div>
            ) : (
              <Button
                size="lg"
                onClick={handleLogin}
                className="btn-tinted-primary shadow-tinted-glow"
              >
                <LogIn className="mr-2" size={16} />
                Login
              </Button>
            )}
          </div>
        </div>
      </header>
    </>
  )
}
