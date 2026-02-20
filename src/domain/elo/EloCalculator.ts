import { DomainError } from '@/domain/errors/DomainError'

export const ELO_FLOOR = 800
export const ELO_START = 1000

export interface EloResult {
  winnerDelta: number
  loserDelta: number
  newWinnerElo: number
  newLoserElo: number
}

export interface IEloCalculator {
  calculate(winnerElo: number, loserElo: number): EloResult
}

export class EloCalculator implements IEloCalculator {
  calculate(winnerElo: number, loserElo: number): EloResult {
    if (winnerElo < ELO_FLOOR) {
      throw new DomainError('ELO_BELOW_FLOOR')
    }
    if (loserElo < ELO_FLOOR) {
      throw new DomainError('ELO_BELOW_FLOOR')
    }

    const diff = loserElo - winnerElo

    let winnerDelta: number
    let loserDelta: number

    if (diff > 50) {
      // beat stronger opponent
      winnerDelta = 25
      loserDelta = -15
    } else if (diff >= -50) {
      // even match
      winnerDelta = 15
      loserDelta = -15
    } else {
      // beat weaker opponent
      winnerDelta = 8
      loserDelta = -25
    }

    const newLoserElo = Math.max(ELO_FLOOR, loserElo + loserDelta)

    return {
      winnerDelta,
      loserDelta,
      newWinnerElo: winnerElo + winnerDelta,
      newLoserElo,
    }
  }
}
