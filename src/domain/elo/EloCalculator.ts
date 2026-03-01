import { DomainError } from '@/domain/errors/DomainError'

export const ELO_FLOOR = 800
export const ELO_START = 1000

export interface EloConfig {
  eloFloor: number
  diffThreshold: number
  strongWinDelta: number
  strongLossDelta: number
  evenWinDelta: number
  evenLossDelta: number
  weakWinDelta: number
  weakLossDelta: number
}

const DEFAULT_CONFIG: EloConfig = {
  eloFloor: ELO_FLOOR,
  diffThreshold: 50,
  strongWinDelta: 25,
  strongLossDelta: 15,
  evenWinDelta: 15,
  evenLossDelta: 15,
  weakWinDelta: 8,
  weakLossDelta: 25,
}

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
  private readonly cfg: EloConfig

  constructor(config?: Partial<EloConfig>) {
    this.cfg = { ...DEFAULT_CONFIG, ...config }
  }

  calculate(winnerElo: number, loserElo: number): EloResult {
    if (winnerElo < this.cfg.eloFloor) {
      throw new DomainError('ELO_BELOW_FLOOR')
    }
    if (loserElo < this.cfg.eloFloor) {
      throw new DomainError('ELO_BELOW_FLOOR')
    }

    const diff = loserElo - winnerElo

    let winnerDelta: number
    let loserDelta: number

    if (diff > this.cfg.diffThreshold) {
      // beat stronger opponent
      winnerDelta = this.cfg.strongWinDelta
      loserDelta = -this.cfg.strongLossDelta
    } else if (diff >= -this.cfg.diffThreshold) {
      // even match
      winnerDelta = this.cfg.evenWinDelta
      loserDelta = -this.cfg.evenLossDelta
    } else {
      // beat weaker opponent
      winnerDelta = this.cfg.weakWinDelta
      loserDelta = -this.cfg.weakLossDelta
    }

    const newLoserElo = Math.max(this.cfg.eloFloor, loserElo + loserDelta)

    return {
      winnerDelta,
      loserDelta,
      newWinnerElo: winnerElo + winnerDelta,
      newLoserElo,
    }
  }
}
