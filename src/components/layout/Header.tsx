// components/layout/header.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { User } from '@supabase/supabase-js';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { LogIn, LogOut, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { TierBadge } from '@/components/tier/TierBadge';
import type { PatreonTier } from '@/types/core';
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from '@/components/ui/navigation-menu';
import { AnimatedThemeToggler } from '../ui/animated-theme-toggler';
import { ThemeAnimationType } from '@/lib/hooks/useModeAnimation';
import { AuthLoadingModal } from '@/components/auth/auth-loading-modal';
import { Navigation } from './Navigation';
import { UserMenu } from '@/components/user/UserMenu';

export function Header() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const pathname = usePathname();
  const supabase = createClient();

  useEffect(() => {
    // Get initial session
    const getUser = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser();
        
        if (error) {
          console.warn('Auth not configured yet:', error.message);
          setUser(null);
        } else {
          setUser(user);
        }
      } catch (error) {
        console.warn('Auth error:', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    getUser();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, [supabase.auth]);

  const handleLogin = useCallback(() => {
    setShowLoginModal(true);
    // Small delay for animation, then redirect
    setTimeout(() => {
      window.location.href = '/auth/login';
    }, 300);
  }, []);

  const handleLogout = useCallback(async () => {
    setShowLogoutModal(true);
    try {
      await supabase.auth.signOut();
      // Redirect to home after logout
      setTimeout(() => {
        window.location.href = '/';
      }, 800);
    } catch (error) {
      console.error('Logout error:', error);
      setShowLogoutModal(false);
    }
  }, [supabase.auth]);

  return (
    <>
      <AuthLoadingModal isOpen={showLoginModal} type="login" />
      <AuthLoadingModal isOpen={showLogoutModal} type="logout" />

      <header className="sticky top-0 w-full bg-white/5 dark:bg-black/20 backdrop-blur-md border-b border-white/10 shadow-lg">
      <div className="container flex h-16 items-center justify-between">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center space-x-2 group"
        >
          <Sparkles className="h-5 w-5 text-defcat-purple transition-transform group-hover:rotate-12 group-hover:scale-110" />
          <span className="font-bold text-xl bg-gradient-to-r from-defcat-purple to-defcat-pink bg-clip-text text-transparent">
            DefCat's DeckVault
          </span>
        </Link>

        {/* Navigation Menu */}
        <NavigationMenu className="hidden md:flex">
          <NavigationMenuList>
            <NavigationMenuItem>
              <NavigationMenuLink asChild>
                <Link
                  href="/decks"
                  className={navigationMenuTriggerStyle() + (pathname === '/decks' ? ' bg-accent text-accent-foreground' : '')}
                >
                  Decks
                </Link>
              </NavigationMenuLink>
            </NavigationMenuItem>

            <NavigationMenuItem>
              <NavigationMenuLink asChild>
                <Link
                  href="/tiers"
                  className={navigationMenuTriggerStyle() + (pathname === '/tiers' ? ' bg-accent text-accent-foreground' : '')}
                >
                  Tiers
                </Link>
              </NavigationMenuLink>
            </NavigationMenuItem>

            <NavigationMenuItem>
              <NavigationMenuLink asChild>
                <Link
                  href="/about"
                  className={navigationMenuTriggerStyle() + (pathname === '/about' ? ' bg-accent text-accent-foreground' : '')}
                >
                  About
                </Link>
              </NavigationMenuLink>
            </NavigationMenuItem>

            <NavigationMenuItem>
              <NavigationMenuLink asChild>
                <Link
                  href="/decks/submission"
                  className={navigationMenuTriggerStyle() + (pathname === '/decks/submission' ? ' bg-accent text-accent-foreground' : '')}
                >
                  Submit Deck
                </Link>
              </NavigationMenuLink>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>

        {/* Right Side Actions */}
        <div className="flex items-center gap-3">
          {/* Theme Toggle */}
          <AnimatedThemeToggler
            animationType={ThemeAnimationType.MANA}
            duration={1000}
            blurAmount={0}
          />
          {/* User Section */}
          {loading ? (
            <div className="h-10 w-10 animate-pulse rounded-full bg-muted/50" />
          ) : user ? (
            <UserMenu user={{
              id: user.id,
              email: user.email || '',
              patreonTier: user.user_metadata?.patreon_tier as PatreonTier || 'Citizen',
              role: user.user_metadata?.role || 'user'
            }} />
          ) : (
            <Button
              size="lg"
              onClick={handleLogin}
              className="button"
            >
              <LogIn color={"var(--foreground)"} size={64}/>
              Login
            </Button>
          )}
        </div>
      </div>
    </header>
    </>
  );
}