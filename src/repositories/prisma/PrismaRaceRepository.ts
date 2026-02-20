import type { PrismaClient } from '@prisma/client'
import type {
  IRaceRepository,
  RaceRecord,
  CreateRaceInput,
} from '@/repositories/interfaces/IRaceRepository'

const includeResults = {
  results: true,
} as const

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
        season: input.season,
        organizerFee: input.organizerFee,
        finalPotCut: input.finalPotCut,
        commissionRate: input.commissionRate,
        resolvedAt: new Date(),
        results: {
          create: input.results,
        },
      },
      include: includeResults,
    })
  }

  async markResolved(id: string): Promise<RaceRecord> {
    return this.prisma.race.update({
      where: { id },
      data: { resolvedAt: new Date() },
      include: includeResults,
    })
  }
}
