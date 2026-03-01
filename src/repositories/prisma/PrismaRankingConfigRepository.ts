import type { PrismaClient } from '@prisma/client'
import type {
  IRankingConfigRepository,
  RankingConfigRecord,
} from '@/repositories/interfaces/IRankingConfigRepository'

export class PrismaRankingConfigRepository implements IRankingConfigRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async get(): Promise<RankingConfigRecord> {
    const record = await this.prisma.rankingConfig.upsert({
      where: { id: 1 },
      create: {},
      update: {},
    })
    return {
      eloFloor: record.eloFloor,
      diffThreshold: record.diffThreshold,
      strongWinDelta: record.strongWinDelta,
      strongLossDelta: record.strongLossDelta,
      evenWinDelta: record.evenWinDelta,
      evenLossDelta: record.evenLossDelta,
      weakWinDelta: record.weakWinDelta,
      weakLossDelta: record.weakLossDelta,
      racePoints1: record.racePoints1,
      racePoints2: record.racePoints2,
      racePoints3: record.racePoints3,
      racePointsOther: record.racePointsOther,
    }
  }

  async update(data: Partial<RankingConfigRecord>): Promise<RankingConfigRecord> {
    const record = await this.prisma.rankingConfig.upsert({
      where: { id: 1 },
      create: { ...data },
      update: { ...data },
    })
    return {
      eloFloor: record.eloFloor,
      diffThreshold: record.diffThreshold,
      strongWinDelta: record.strongWinDelta,
      strongLossDelta: record.strongLossDelta,
      evenWinDelta: record.evenWinDelta,
      evenLossDelta: record.evenLossDelta,
      weakWinDelta: record.weakWinDelta,
      weakLossDelta: record.weakLossDelta,
      racePoints1: record.racePoints1,
      racePoints2: record.racePoints2,
      racePoints3: record.racePoints3,
      racePointsOther: record.racePointsOther,
    }
  }
}
