'use client';

import { createClient } from '@/lib/supabase/client';
import { useQuery } from '@tanstack/react-query';
import type { User } from '@/types/core';

/**
 * Client-side auth hook using React Query
 * Provides current user state with automatic refetching
 */
export function useAuth() {
  const supabase = createClient();

  const { data: user, isLoading, error } = useQuery({
    queryKey: ['auth-user'],
    queryFn: async (): Promise<User | null> => {
      // Get user - suppress OAuth validation errors since we use custom Patreon OAuth
      let authUser
      try {
        const {
          data: { user: u },
        } = await supabase.auth.getUser();
        authUser = u
      } catch (err: any) {
        // Suppress "missing destination name oauth_client_id" errors
        // These occur because we use custom Patreon OAuth, not Supabase native OAuth
        if (err?.code === 'unexpected_failure' && err?.message?.includes('oauth_client_id')) {
          // Try to get user from session instead
          const {
            data: { session },
          } = await supabase.auth.getSession()
          authUser = session?.user || null
        } else {
          console.error('Error getting user:', err)
          return null
        }
      }

      if (!authUser) return null;

      // Fetch profile with tier and role info
      const { data: profile } = await supabase
        .from('profiles')
        .select('patreon_id, patreon_tier, role')
        .eq('id', authUser.id)
        .single<{
          patreon_id: string | null;
          patreon_tier: string | null;
          role: string | null;
        }>();

      return {
        id: authUser.id,
        email: authUser.email!,
        patreonId: profile?.patreon_id || null,
        patreonTier: (profile?.patreon_tier as User['patreonTier']) || 'Citizen',
        role: (profile?.role as User['role']) || 'user',
      };
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes
  });

  return {
    user,
    tier: user?.patreonTier || 'Citizen',
    role: user?.role || 'user',
    isLoading,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    error,
  };
}
