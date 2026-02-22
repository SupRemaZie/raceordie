export interface SeasonDriver {
  id: string
  position: number
  elo: number
}

export interface SeasonRewardResult {
  driverId: string
  title: 'King of the Streets' | 'Elite Runner' | 'Night Predator' | null
  eloBonus: number
  prizePoolCutMin: number
  prizePoolCutMax: number
  privilege: string | null
}

export const CURRENT_SEASON = 1
