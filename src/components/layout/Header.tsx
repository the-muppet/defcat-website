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
import { cn } from '@/lib/utils';

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

      <header className="sticky top-0 w-full glass-tinted-strong shadow-tinted-lg z-50">
        <div className="container flex h-16 items-center justify-between">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center space-x-2 group hover-tinted rounded-lg px-3 py-2 -ml-3"
          >
            <Sparkles className="h-5 w-5 text-tinted transition-transform group-hover:rotate-12 group-hover:scale-110" />
            <span className="font-bold text-xl gradient-tinted-text">
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
                    className={cn(
                      navigationMenuTriggerStyle(),
                      "hover-tinted",
                      pathname === '/decks' && "tinted-accent border border-tinted"
                    )}
                  >
                    Decks
                  </Link>
                </NavigationMenuLink>
              </NavigationMenuItem>

              <NavigationMenuItem>
                <NavigationMenuLink asChild>
                  <Link
                    href="/tiers"
                    className={cn(
                      navigationMenuTriggerStyle(),
                      "hover-tinted",
                      pathname === '/tiers' && "tinted-accent border border-tinted"
                    )}
                  >
                    Tiers
                  </Link>
                </NavigationMenuLink>
              </NavigationMenuItem>

              <NavigationMenuItem>
                <NavigationMenuLink asChild>
                  <Link
                    href="/about"
                    className={cn(
                      navigationMenuTriggerStyle(),
                      "hover-tinted",
                      pathname === '/about' && "tinted-accent border border-tinted"
                    )}
                  >
                    About
                  </Link>
                </NavigationMenuLink>
              </NavigationMenuItem>

              <NavigationMenuItem>
                <NavigationMenuLink asChild>
                  <Link
                    href="/decks/submission"
                    className={cn(
                      navigationMenuTriggerStyle(),
                      "hover-tinted",
                      pathname === '/decks/submission' && "tinted-accent border border-tinted"
                    )}
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
              className="hover-tinted rounded-full p-2"
            />
            {/* User Section */}
            {loading ? (
              <div className="h-10 w-10 rounded-full tinted-accent shimmer-tinted" />
            ) : user ? (
              <div className="hover-tinted rounded-full">
                <UserMenu user={{
                  id: user.id,
                  email: user.email || '',
                  patreonTier: user.user_metadata?.patreon_tier as PatreonTier || 'Citizen',
                  role: user.user_metadata?.role || 'user'
                }} />
              </div>
            ) : (
              <Button
                size="lg"
                onClick={handleLogin}
                className="btn-tinted-primary shadow-tinted-glow"
              >
                <LogIn className="mr-2" size={16}/>
                Login
              </Button>
            )}
          </div>
        </div>
      </header>
    </>
  );
}