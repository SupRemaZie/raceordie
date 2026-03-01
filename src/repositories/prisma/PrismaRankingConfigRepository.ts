import type { PrismaClient } from '@prisma/client'
import type {
  IRankingConfigRepository,
  RankingConfigRecord,
} from '@/repositories/interfaces/IRankingConfigRepository'

function toRecord(record: {
  eloFloor: number; diffThreshold: number
  strongWinDelta: number; strongLossDelta: number
  evenWinDelta: number; evenLossDelta: number
  weakWinDelta: number; weakLossDelta: number
  racePoints1: number; racePoints2: number
  racePoints3: number; racePointsOther: number
  raceCommissionPct: number; challengeCommissionPct: number
}): RankingConfigRecord {
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
    raceCommissionPct: record.raceCommissionPct,
    challengeCommissionPct: record.challengeCommissionPct,
  }
}

export class PrismaRankingConfigRepository implements IRankingConfigRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async get(): Promise<RankingConfigRecord> {
    const record = await this.prisma.rankingConfig.upsert({
      where: { id: 1 },
      create: {},
      update: {},
    })
    return toRecord(record)
  }

  async update(data: Partial<RankingConfigRecord>): Promise<RankingConfigRecord> {
    const record = await this.prisma.rankingConfig.upsert({
      where: { id: 1 },
      create: { ...data },
      update: { ...data },
    })
    return toRecord(record)
  }
}
