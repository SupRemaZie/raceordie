export interface SeasonStatsRecord {
  season: number
  totalRaces: number
  totalChallenges: number
  finalPot: number
}

export interface ISeasonRepository {
  getCurrentSeason(): Promise<number>
  getStats(season: number): Promise<SeasonStatsRecord>
  accumulateFinalPot(season: number, amount: number): Promise<void>
  closeSeason(season: number): Promise<void>
}
