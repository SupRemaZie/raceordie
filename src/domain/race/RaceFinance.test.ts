import { describe, it, expect } from 'vitest'
import { RaceFinance } from './RaceFinance'
import { DomainError } from '@/domain/errors/DomainError'

describe('RaceFinance', () => {
  const finance = new RaceFinance()

  describe('valid calculations', () => {
    it('calculates with 25% commission rate', () => {
      const result = finance.calculate({
        stakes: [1000, 1000, 1000], // totalPool = 3000
        commissionRate: 0.25,
      })

      expect(result.totalPool).toBe(3000)
      expect(result.organizerFee).toBe(750) // 3000 * 0.25
      expect(result.finalPotContribution).toBe(37) // Math.floor(750 * 0.05)
    })

    it('calculates with 30% commission rate', () => {
      const result = finance.calculate({
        stakes: [1000, 1000, 1000],
        commissionRate: 0.30,
      })

      expect(result.totalPool).toBe(3000)
      expect(result.organizerFee).toBe(900) // 3000 * 0.30
      expect(result.finalPotContribution).toBe(45) // Math.floor(900 * 0.05)
    })

    it('splits prizes 60/25/15 of prize pool (after fee)', () => {
      const result = finance.calculate({
        stakes: [2000, 2000, 2000], // totalPool = 6000
        commissionRate: 0.25,
      })
      // organizerFee = 1500, prizePool = 4500
      expect(result.payouts.first).toBe(2700)  // 4500 * 0.60
      expect(result.payouts.second).toBe(1125) // 4500 * 0.25
      expect(result.payouts.third).toBe(675)   // 4500 * 0.15
    })

    it('all amounts are integers (no floats)', () => {
      const result = finance.calculate({
        stakes: [333, 333, 334],
        commissionRate: 0.25,
      })
      expect(Number.isInteger(result.totalPool)).toBe(true)
      expect(Number.isInteger(result.organizerFee)).toBe(true)
      expect(Number.isInteger(result.finalPotContribution)).toBe(true)
      expect(Number.isInteger(result.payouts.first)).toBe(true)
      expect(Number.isInteger(result.payouts.second)).toBe(true)
      expect(Number.isInteger(result.payouts.third)).toBe(true)
    })

    it('accepts more than 3 drivers', () => {
      const result = finance.calculate({
        stakes: [500, 500, 500, 500],
        commissionRate: 0.25,
      })
      expect(result.totalPool).toBe(2000)
    })
  })

  describe('error cases', () => {
    it('throws INVALID_COMMISSION_RATE for 0.20', () => {
      expect(() =>
        finance.calculate({ stakes: [100, 100, 100], commissionRate: 0.20 as never })
      ).toThrow(DomainError)
    })

    it('throws INSUFFICIENT_DRIVERS for fewer than 3 drivers', () => {
      expect(() =>
        finance.calculate({ stakes: [100, 100], commissionRate: 0.25 })
      ).toThrow(DomainError)
    })

    it('throws INVALID_STAKE for non-integer stake', () => {
      expect(() =>
        finance.calculate({ stakes: [100.5, 100, 100], commissionRate: 0.25 })
      ).toThrow(DomainError)
    })

    it('throws INVALID_STAKE for zero stake', () => {
      expect(() =>
        finance.calculate({ stakes: [0, 100, 100], commissionRate: 0.25 })
      ).toThrow(DomainError)
    })
  })
})
