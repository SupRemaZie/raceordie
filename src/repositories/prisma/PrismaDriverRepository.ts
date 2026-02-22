import type { PrismaClient } from '@prisma/client'
import type {
  IDriverRepository,
  DriverRecord,
  CreateDriverInput,
  UpdateDriverInput,
} from '@/repositories/interfaces/IDriverRepository'
import { DomainError } from '@/domain/errors/DomainError'

export class PrismaDriverRepository implements IDriverRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findById(id: string): Promise<DriverRecord | null> {
    return this.prisma.driver.findUnique({ where: { id } })
  }

  async findByTag(tag: string): Promise<DriverRecord | null> {
    return this.prisma.driver.findUnique({ where: { tag } })
  }

  async findAll(): Promise<DriverRecord[]> {
    return this.prisma.driver.findMany({ orderBy: { elo: 'desc' } })
  }

  async findRanking(): Promise<DriverRecord[]> {
    return this.prisma.driver.findMany({
      where: { archived: false },
      orderBy: { elo: 'desc' },
    })
  }

  async create(input: CreateDriverInput): Promise<DriverRecord> {
    const [byTag, byName] = await Promise.all([
      this.prisma.driver.findUnique({ where: { tag: input.tag } }),
      this.prisma.driver.findUnique({ where: { name: input.name } }),
    ])
    if (byTag) throw new DomainError('TAG_TAKEN')
    if (byName) throw new DomainError('NAME_TAKEN')
    return this.prisma.driver.create({ data: input })
  }

  async update(id: string, input: UpdateDriverInput): Promise<DriverRecord> {
    if (input.name) {
      const existing = await this.prisma.driver.findUnique({ where: { name: input.name } })
      if (existing && existing.id !== id) throw new DomainError('NAME_TAKEN')
    }
    return this.prisma.driver.update({ where: { id }, data: input })
  }

  async delete(id: string): Promise<void> {
    await this.prisma.driver.delete({ where: { id } })
  }
}
