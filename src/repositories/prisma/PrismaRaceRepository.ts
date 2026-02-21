import type { PrismaClient } from '@prisma/client'
import type {
  IRaceRepository,
  RaceRecord,
  CreateRaceInput,
} from '@/repositories/interfaces/IRaceRepository'

const includeResults = { results: true } as const

export class PrismaRaceRepository implements IRaceRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findById(id: string): Promise<RaceRecord | null> {
    return this.prisma.race.findUnique({ where: { id }, include: includeResults })
  }

  async findBySeason(season: number): Promise<RaceRecord[]> {
    return this.prisma.race.findMany({
      where: { season },
      include: includeResults,
      orderBy: { createdAt: 'desc' },
    })
  }

  async findAll(): Promise<RaceRecord[]> {
    return this.prisma.race.findMany({
      include: includeResults,
      orderBy: { createdAt: 'desc' },
    })
  }

  async create(input: CreateRaceInput): Promise<RaceRecord> {
    return this.prisma.race.create({
      data: {
        name: input.name,
        raceDate: input.raceDate,
        checkpoints: input.checkpoints,
        season: input.season,
        organizerFee: input.organizerFee,
        finalPotCut: input.finalPotCut,
        commissionRate: input.commissionRate,
        circuitId: input.circuitId ?? null,
        // resolvedAt intentionally omitted → race starts as pending
        results: {
          create: input.participants.map((p) => ({
            driverId: p.driverId,
            stake: p.stake,
            position: 0,
            payout: 0,
          })),
        },
      },
      include: includeResults,
    })
  }

  async delete(id: string): Promise<void> {
    await this.prisma.race.delete({ where: { id } })
  }

  async updateResults(
    id: string,
    results: Array<{ driverId: string; position: number; payout: number }>,
  ): Promise<RaceRecord> {
    await Promise.all(
      results.map((r) =>
        this.prisma.raceResult.updateMany({
          where: { raceId: id, driverId: r.driverId },
          data: { position: r.position, payout: r.payout },
        }),
      ),
    )
    return this.prisma.race.update({
      where: { id },
      data: { resolvedAt: new Date() },
      include: includeResults,
    })
  }
}
