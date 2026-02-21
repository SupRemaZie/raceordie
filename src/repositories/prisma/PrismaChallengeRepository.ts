import type { PrismaClient } from '@prisma/client'
import type {
  IChallengeRepository,
  ChallengeRecord,
  CreateChallengeInput,
} from '@/repositories/interfaces/IChallengeRepository'
import { DomainError } from '@/domain/errors/DomainError'

export class PrismaChallengeRepository implements IChallengeRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findById(id: string): Promise<ChallengeRecord | null> {
    return this.prisma.challenge.findUnique({ where: { id } })
  }

  async findBySeason(season: number): Promise<ChallengeRecord[]> {
    return this.prisma.challenge.findMany({
      where: { season },
      orderBy: { createdAt: 'desc' },
    })
  }

  async findByDriver(driverId: string): Promise<ChallengeRecord[]> {
    return this.prisma.challenge.findMany({
      where: {
        OR: [{ player1Id: driverId }, { player2Id: driverId }],
      },
      orderBy: { createdAt: 'desc' },
    })
  }

  async create(input: CreateChallengeInput): Promise<ChallengeRecord> {
    return this.prisma.challenge.create({ data: input })
  }

  async resolve(id: string, winnerId: string): Promise<ChallengeRecord> {
    const challenge = await this.prisma.challenge.findUnique({ where: { id } })
    if (!challenge) throw new DomainError('CHALLENGE_NOT_FOUND')
    if (challenge.status !== 'ACTIVE') throw new DomainError('CHALLENGE_NOT_ACTIVE')

    return this.prisma.challenge.update({
      where: { id },
      data: { status: 'RESOLVED', winnerId },
    })
  }

  async cancel(id: string): Promise<ChallengeRecord> {
    const challenge = await this.prisma.challenge.findUnique({ where: { id } })
    if (!challenge) throw new DomainError('CHALLENGE_NOT_FOUND')
    if (challenge.status === 'RESOLVED') throw new DomainError('CHALLENGE_ALREADY_RESOLVED')

    return this.prisma.challenge.update({
      where: { id },
      data: { status: 'CANCELLED' },
    })
  }

  async delete(id: string): Promise<void> {
    await this.prisma.challenge.delete({ where: { id } })
  }

  async activate(id: string): Promise<ChallengeRecord> {
    const challenge = await this.prisma.challenge.findUnique({ where: { id } })
    if (!challenge) throw new DomainError('CHALLENGE_NOT_FOUND')
    if (challenge.status !== 'PENDING') throw new DomainError('CHALLENGE_NOT_PENDING')

    return this.prisma.challenge.update({
      where: { id },
      data: { status: 'ACTIVE' },
    })
  }
}
