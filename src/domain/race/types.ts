export type CommissionRate = 0.25 | 0.30

export interface RaceFinanceInput {
  stakes: number[]        // each driver's entry stake (integers)
  commissionRate: CommissionRate
}

export interface RaceFinanceResult {
  totalPool: number
  organizerFee: number
  finalPotContribution: number
  payouts: {
    first: number
    second: number
    third: number
  }
}
