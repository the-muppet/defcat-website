/**
 * Tests for Patreon API client
 */

import { describe, expect, it } from 'vitest'
import { determineTier } from '../patreon'

describe('Patreon API', () => {
  describe('determineTier', () => {
    it('should return free tier for $0', () => {
      expect(determineTier(0)).toBe('free')
    })

    it('should return bronze tier for $5', () => {
      expect(determineTier(500)).toBe('bronze')
    })

    it('should return silver tier for $10', () => {
      expect(determineTier(1000)).toBe('silver')
    })

    it('should return gold tier for $20+', () => {
      expect(determineTier(2000)).toBe('gold')
      expect(determineTier(5000)).toBe('gold')
    })

    it('should handle edge cases correctly', () => {
      expect(determineTier(499)).toBe('free')
      expect(determineTier(500)).toBe('bronze')
      expect(determineTier(999)).toBe('bronze')
      expect(determineTier(1000)).toBe('silver')
      expect(determineTier(1999)).toBe('silver')
    })
  })
})
