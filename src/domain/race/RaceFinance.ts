import { DomainError } from '@/domain/errors/DomainError'
import type { CommissionRate, RaceFinanceInput, RaceFinanceResult } from './types'

export const VALID_COMMISSION_RATES: CommissionRate[] = [0.25, 0.30]

export const PAYOUT_SPLITS = {
  first: 0.60,
  second: 0.25,
  third: 0.15,
} as const

export const FINAL_POT_RATE = 0.05

export class RaceFinance {
  calculate(input: RaceFinanceInput): RaceFinanceResult {
    if (!VALID_COMMISSION_RATES.includes(input.commissionRate)) {
      throw new DomainError('INVALID_COMMISSION_RATE')
    }

    if (input.stakes.length < 3) {
      throw new DomainError('INSUFFICIENT_DRIVERS')
    }

    if (input.stakes.some((s) => !Number.isInteger(s) || s <= 0)) {
      throw new DomainError('INVALID_STAKE')
    }

    const totalPool = input.stakes.reduce((sum, s) => sum + s, 0)
    const organizerFee = Math.floor(totalPool * input.commissionRate)
    const finalPotContribution = Math.floor(organizerFee * FINAL_POT_RATE)
    const prizePool = totalPool - organizerFee

    const payouts = {
      first: Math.floor(prizePool * PAYOUT_SPLITS.first),
      second: Math.floor(prizePool * PAYOUT_SPLITS.second),
      third: Math.floor(prizePool * PAYOUT_SPLITS.third),
    }

    return {
      totalPool,
      organizerFee,
      finalPotContribution,
      payouts,
    }
  }
}
