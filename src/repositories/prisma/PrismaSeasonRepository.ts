import type { PrismaClient } from '@prisma/client'
import type {
  ISeasonRepository,
  SeasonStatsRecord,
} from '@/repositories/interfaces/ISeasonRepository'

// Season state is derived from race/challenge data
// We use a simple config table approach via a KV in memory or config
// For MVP, season is stored as an env-driven constant or derived from records
export class PrismaSeasonRepository implements ISeasonRepository {
  private currentSeason = 1

  constructor(private readonly prisma: PrismaClient) {}

  async getCurrentSeason(): Promise<number> {
    return this.currentSeason
  }

  async getStats(season: number): Promise<SeasonStatsRecord> {
    const [totalRaces, totalChallenges] = await Promise.all([
      this.prisma.race.count({ where: { season } }),
      this.prisma.challenge.count({ where: { season } }),
    ])

    // Sum up finalPotCut from all races in this season
    const finalPotAgg = await this.prisma.race.aggregate({
      where: { season },
      _sum: { finalPotCut: true },
    })

    return {
      season,
      totalRaces,
      totalChallenges,
      finalPot: finalPotAgg._sum.finalPotCut ?? 0,
    }
  }

  async accumulateFinalPot(_season: number, _amount: number): Promise<void> {
    // Pot is derived from sum of finalPotCut in races — nothing to store separately
  }

  async closeSeason(_season: number): Promise<void> {
    this.currentSeason += 1
  }
}
