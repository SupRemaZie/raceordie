export interface ChallengeFinanceInput {
  stake: number // per driver, integer
}

export interface ChallengeFinanceResult {
  totalPool: number
  organizerFee: number
  winnerPrize: number
}
