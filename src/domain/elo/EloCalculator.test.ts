import { describe, it, expect } from 'vitest'
import { EloCalculator, ELO_FLOOR, ELO_START } from './EloCalculator'
import { DomainError } from '@/domain/errors/DomainError'

describe('EloCalculator', () => {
  const calc = new EloCalculator()

  describe('beat stronger opponent (diff > 50)', () => {
    it('gives winner +25 and loser -15', () => {
      const result = calc.calculate(1000, 1100) // diff = 100 > 50
      expect(result.winnerDelta).toBe(25)
      expect(result.loserDelta).toBe(-15)
      expect(result.newWinnerElo).toBe(1025)
      expect(result.newLoserElo).toBe(1085)
    })

    it('works at exactly diff = 51', () => {
      const result = calc.calculate(1000, 1051)
      expect(result.winnerDelta).toBe(25)
      expect(result.loserDelta).toBe(-15)
    })
  })

  describe('even match (-50 ≤ diff ≤ 50)', () => {
    it('gives winner +15 and loser -15 for equal ELO', () => {
      const result = calc.calculate(1000, 1000)
      expect(result.winnerDelta).toBe(15)
      expect(result.loserDelta).toBe(-15)
      expect(result.newWinnerElo).toBe(1015)
      expect(result.newLoserElo).toBe(985)
    })

    it('works at diff = 50 boundary', () => {
      const result = calc.calculate(1000, 1050)
      expect(result.winnerDelta).toBe(15)
      expect(result.loserDelta).toBe(-15)
    })

    it('works at diff = -50 boundary', () => {
      const result = calc.calculate(1050, 1000)
      expect(result.winnerDelta).toBe(15)
      expect(result.loserDelta).toBe(-15)
    })
  })

  describe('beat weaker opponent (diff < -50)', () => {
    it('gives winner +8 and loser -25', () => {
      const result = calc.calculate(1200, 1000) // diff = -200 < -50
      expect(result.winnerDelta).toBe(8)
      expect(result.loserDelta).toBe(-25)
      expect(result.newWinnerElo).toBe(1208)
      expect(result.newLoserElo).toBe(975)
    })

    it('works at exactly diff = -51', () => {
      const result = calc.calculate(1051, 1000)
      expect(result.winnerDelta).toBe(8)
      expect(result.loserDelta).toBe(-25)
    })
  })

  describe('ELO floor enforcement', () => {
    it('does not let loser fall below ELO_FLOOR', () => {
      const result = calc.calculate(1200, ELO_FLOOR + 10) // loser near floor
      expect(result.newLoserElo).toBeGreaterThanOrEqual(ELO_FLOOR)
    })

    it('clamps loser ELO to floor when delta would go below', () => {
      const result = calc.calculate(1200, ELO_FLOOR + 5)
      expect(result.newLoserElo).toBe(ELO_FLOOR)
    })

    it('throws DomainError when winnerElo is below floor', () => {
      expect(() => calc.calculate(799, 1000)).toThrow(DomainError)
    })

    it('throws DomainError when loserElo is below floor', () => {
      expect(() => calc.calculate(1000, 799)).toThrow(DomainError)
    })
  })

  describe('constants', () => {
    it('ELO_FLOOR is 800', () => {
      expect(ELO_FLOOR).toBe(800)
    })

    it('ELO_START is 1000', () => {
      expect(ELO_START).toBe(1000)
    })
  })
})
