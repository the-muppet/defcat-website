/**
 * Tests for Authentication utilities
 */

import { describe, expect, it } from 'vitest'

describe('Auth Utilities', () => {
  it('should export auth helper functions', async () => {
    const { getCurrentUser, requireAuth, requireTier } = await import('@/lib/auth')

    expect(getCurrentUser).toBeDefined()
    expect(typeof getCurrentUser).toBe('function')
    expect(requireAuth).toBeDefined()
    expect(typeof requireAuth).toBe('function')
    expect(requireTier).toBeDefined()
    expect(typeof requireTier).toBe('function')
  })
})
