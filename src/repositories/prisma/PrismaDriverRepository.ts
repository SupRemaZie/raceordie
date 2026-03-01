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
    const byName = await this.prisma.driver.findUnique({ where: { name: input.name } })
    if (byName) throw new DomainError('NAME_TAKEN')
    if (input.loginCode) {
      const byCode = await this.prisma.driver.findUnique({ where: { loginCode: input.loginCode } })
      if (byCode) throw new DomainError('LOGIN_CODE_TAKEN')
    }
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
