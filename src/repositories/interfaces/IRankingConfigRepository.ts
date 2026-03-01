export interface RankingConfigRecord {
  eloFloor: number
  diffThreshold: number
  strongWinDelta: number
  strongLossDelta: number
  evenWinDelta: number
  evenLossDelta: number
  weakWinDelta: number
  weakLossDelta: number
  racePoints1: number
  racePoints2: number
  racePoints3: number
  racePointsOther: number
}

export interface IRankingConfigRepository {
  get(): Promise<RankingConfigRecord>
  update(data: Partial<RankingConfigRecord>): Promise<RankingConfigRecord>
}
