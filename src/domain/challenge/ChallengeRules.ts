import { DomainError } from '@/domain/errors/DomainError'
import type { ChallengeFinanceInput, ChallengeFinanceResult } from './types'

export const CHALLENGE_COMMISSION_RATE = 0.15

export class ChallengeRules {
  calculate(input: ChallengeFinanceInput): ChallengeFinanceResult {
    if (!Number.isInteger(input.stake) || input.stake <= 0) {
      throw new DomainError('INVALID_STAKE')
    }

    const totalPool = input.stake * 2
    const organizerFee = Math.floor(totalPool * CHALLENGE_COMMISSION_RATE)
    const winnerPrize = totalPool - organizerFee

    return {
      totalPool,
      organizerFee,
      winnerPrize,
    }
  }
}
