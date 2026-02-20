import type { PrismaClient } from '@prisma/client'
import type {
  IDriverRepository,
  DriverRecord,
  CreateDriverInput,
  UpdateDriverInput,
} from '@/repositories/interfaces/IDriverRepository'
import { DomainError } from '@/domain/errors/DomainError'
import { LICENSE_PRICE } from '@/domain/season/types'

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

  async findRanking(season: number): Promise<DriverRecord[]> {
    return this.prisma.driver.findMany({
      where: {
        licenses: { some: { season } },
      },
      orderBy: { elo: 'desc' },
    })
  }

  async create(input: CreateDriverInput): Promise<DriverRecord> {
    const existing = await this.prisma.driver.findUnique({
      where: { tag: input.tag },
    })
    if (existing) {
      throw new DomainError('TAG_TAKEN')
    }
    return this.prisma.driver.create({ data: input })
  }

  async update(id: string, input: UpdateDriverInput): Promise<DriverRecord> {
    return this.prisma.driver.update({ where: { id }, data: input })
  }

  async hasLicense(driverId: string, season: number): Promise<boolean> {
    const license = await this.prisma.license.findUnique({
      where: { driverId_season: { driverId, season } },
    })
    return license !== null
  }

  async purchaseLicense(driverId: string, season: number): Promise<void> {
    const driver = await this.prisma.driver.findUnique({ where: { id: driverId } })
    if (!driver) throw new DomainError('DRIVER_NOT_FOUND')
    if (driver.balance < LICENSE_PRICE) throw new DomainError('INSUFFICIENT_BALANCE')

    await this.prisma.$transaction([
      this.prisma.driver.update({
        where: { id: driverId },
        data: { balance: { decrement: LICENSE_PRICE } },
      }),
      this.prisma.license.create({
        data: { driverId, season },
      }),
    ])
  }

  async revokeAllLicenses(season: number): Promise<void> {
    await this.prisma.license.deleteMany({ where: { season } })
  }
}
