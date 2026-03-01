import { DomainError } from '@/domain/errors/DomainError'
import type { ChallengeFinanceInput, ChallengeFinanceResult } from './types'

export const CHALLENGE_COMMISSION_RATE = 0.15

export class ChallengeRules {
  calculate(input: ChallengeFinanceInput): ChallengeFinanceResult {
    if (!Number.isInteger(input.stake) || input.stake <= 0) {
      throw new DomainError('INVALID_STAKE')
    }

    const totalPool = input.stake * 2
    const rate = input.commissionRate ?? CHALLENGE_COMMISSION_RATE
    const organizerFee = Math.floor(totalPool * rate)
    const winnerPrize = totalPool - organizerFee

    return {
      totalPool,
      organizerFee,
      winnerPrize,
    }
  }
}
