/** biome-ignore-all assist/source/organizeImports: <explanation> */
'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ThemeProvider } from 'next-themes'
import { useState } from 'react'
import { Toaster } from '@/components/ui/toaster'
import { ManaColorProvider } from './ManaColorContext'
import { AuthProvider } from '../auth/client-auth'

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 5 * 60 * 1000, // 5 minutes
            gcTime: 10 * 60 * 1000, // 10 minutes
            retry: 2,
            refetchOnWindowFocus: true,
            refetchOnMount: false,
            refetchOnReconnect: true,
          },
        },
      })
  )

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
        <ManaColorProvider>
          <AuthProvider>
            {children}
            <Toaster />
          </AuthProvider>
        </ManaColorProvider>
      </ThemeProvider>
    </QueryClientProvider>
  )
}
