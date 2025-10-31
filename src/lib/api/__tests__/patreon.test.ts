/**
 * Tests for Patreon API client
 */

import { describe, expect, it } from 'vitest'
import { determineTier } from '../patreon'

describe('Patreon API', () => {
  describe('determineTier', () => {
    it('should return Citizen tier for $0', () => {
      expect(determineTier(0)).toBe('Citizen')
    })

    it('should return Citizen tier for amounts below $10', () => {
      expect(determineTier(200)).toBe('Citizen') // $2
      expect(determineTier(500)).toBe('Citizen') // $5
      expect(determineTier(999)).toBe('Citizen') // $9.99
    })

    it('should return Knight tier for $10-$29.99', () => {
      expect(determineTier(1000)).toBe('Knight') // $10 exactly
      expect(determineTier(1500)).toBe('Knight') // $15
      expect(determineTier(2999)).toBe('Knight') // $29.99
    })

    it('should return Emissary tier for $30-$49.99', () => {
      expect(determineTier(3000)).toBe('Emissary') // $30 exactly
      expect(determineTier(4000)).toBe('Emissary') // $40
      expect(determineTier(4999)).toBe('Emissary') // $49.99
    })

    it('should return Duke tier for $50-$164.99', () => {
      expect(determineTier(5000)).toBe('Duke') // $50 exactly
      expect(determineTier(10000)).toBe('Duke') // $100
      expect(determineTier(16499)).toBe('Duke') // $164.99
    })

    it('should return Wizard tier for $165-$249.99', () => {
      expect(determineTier(16500)).toBe('Wizard') // $165 exactly
      expect(determineTier(20000)).toBe('Wizard') // $200
      expect(determineTier(24999)).toBe('Wizard') // $249.99
    })

    it('should return ArchMage tier for $250+', () => {
      expect(determineTier(25000)).toBe('ArchMage') // $250 exactly
      expect(determineTier(50000)).toBe('ArchMage') // $500
      expect(determineTier(100000)).toBe('ArchMage') // $1000
    })

    it('should handle edge cases at tier boundaries', () => {
      expect(determineTier(999)).toBe('Citizen') // Just below Knight
      expect(determineTier(1000)).toBe('Knight') // Knight threshold
      expect(determineTier(2999)).toBe('Knight') // Just below Emissary
      expect(determineTier(3000)).toBe('Emissary') // Emissary threshold
      expect(determineTier(4999)).toBe('Emissary') // Just below Duke
      expect(determineTier(5000)).toBe('Duke') // Duke threshold
      expect(determineTier(16499)).toBe('Duke') // Just below Wizard
      expect(determineTier(16500)).toBe('Wizard') // Wizard threshold
      expect(determineTier(24999)).toBe('Wizard') // Just below ArchMage
      expect(determineTier(25000)).toBe('ArchMage') // ArchMage threshold
    })
  })
})
