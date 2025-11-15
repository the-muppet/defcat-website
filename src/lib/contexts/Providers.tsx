/** biome-ignore-all assist/source/organizeImports: <explanation> */
'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ThemeProvider } from 'next-themes'
import { type ReactNode, useState } from 'react'
import { Toaster } from '@/components/ui/toaster'
import { ManaColorProvider } from './ManaColorContext'
import { AuthProvider } from '../auth/client'

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 5 * 60 * 1000,
            gcTime: 10 * 60 * 1000,
            retry: 2,
            refetchOnWindowFocus: false,
            refetchOnMount: false,
            refetchOnReconnect: true,
          },
        },
      })
  )

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <ManaColorProvider>
            {children}
            <Toaster />
          </ManaColorProvider>
        </ThemeProvider>
      </AuthProvider>
    </QueryClientProvider>
  )
}
