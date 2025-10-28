/**
 * Tests for Supabase Client utilities
 */

import { beforeEach, describe, expect, it, vi } from 'vitest'

describe('Supabase Client', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should have environment variables configured', () => {
    expect(process.env.NEXT_PUBLIC_SUPABASE_URL).toBeDefined()
    expect(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY).toBeDefined()
  })

  it('should export client creation functions', async () => {
    const { createClient: createBrowserClient } = await import('../client')
    const { createClient: createServerClient } = await import('../server')
    const { createAdminClient } = await import('../admin')

    expect(createBrowserClient).toBeDefined()
    expect(typeof createBrowserClient).toBe('function')
    expect(createServerClient).toBeDefined()
    expect(typeof createServerClient).toBe('function')
    expect(createAdminClient).toBeDefined()
    expect(typeof createAdminClient).toBe('function')
  })
})
