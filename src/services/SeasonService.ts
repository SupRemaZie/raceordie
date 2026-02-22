import type { IDriverRepository } from '@/repositories/interfaces/IDriverRepository'
import type { ISeasonRepository, SeasonStatsRecord } from '@/repositories/interfaces/ISeasonRepository'
import { SeasonRewards } from '@/domain/season/SeasonRewards'
import type { SeasonRewardResult } from '@/domain/season/types'
import { KING_ELO_BONUS, NIGHT_PREDATOR_ELO_BONUS } from '@/domain/season/SeasonRewards'

export class SeasonService {
  private readonly rewards = new SeasonRewards()

  constructor(
    private readonly drivers: IDriverRepository,
    private readonly seasons: ISeasonRepository,
  ) {}

  async getStats(): Promise<SeasonStatsRecord> {
    const season = await this.seasons.getCurrentSeason()
    return this.seasons.getStats(season)
  }

  async closeSeason(): Promise<SeasonRewardResult[]> {
    const season = await this.seasons.getCurrentSeason()
    const ranking = await this.drivers.findRanking()

    const topDrivers = ranking.slice(0, 3).map((d, idx) => ({
      id: d.id,
      position: idx + 1,
      elo: d.elo,
    }))

    const rewardResults = this.rewards.calculate(topDrivers)

    // Apply ELO bonuses for next season
    for (const reward of rewardResults) {
      if (reward.eloBonus > 0) {
        const driver = await this.drivers.findById(reward.driverId)
        if (driver) {
          await this.drivers.update(reward.driverId, {
            elo: driver.elo + reward.eloBonus,
          })
        }
      }
    }

    await this.seasons.closeSeason(season)

    return rewardResults
  }
}
