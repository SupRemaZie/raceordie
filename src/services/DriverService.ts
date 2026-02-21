import type {
  IDriverRepository,
  DriverRecord,
  CreateDriverInput,
  UpdateDriverInput,
} from '@/repositories/interfaces/IDriverRepository'
import type { ISeasonRepository } from '@/repositories/interfaces/ISeasonRepository'
import { DomainError } from '@/domain/errors/DomainError'

export class DriverService {
  constructor(
    private readonly drivers: IDriverRepository,
    private readonly seasons: ISeasonRepository,
  ) {}

  async createDriver(input: CreateDriverInput): Promise<DriverRecord> {
    if (input.tag.length > 4) throw new DomainError('TAG_TOO_LONG')
    if (!/^[A-Z0-9]{2,4}$/.test(input.tag)) throw new DomainError('INVALID_TAG')
    return this.drivers.create(input)
  }

  async getDriver(id: string): Promise<DriverRecord> {
    const driver = await this.drivers.findById(id)
    if (!driver) throw new DomainError('DRIVER_NOT_FOUND')
    return driver
  }

  async getRanking(): Promise<DriverRecord[]> {
    const season = await this.seasons.getCurrentSeason()
    return this.drivers.findRanking(season)
  }

  async purchaseLicense(driverId: string): Promise<void> {
    const season = await this.seasons.getCurrentSeason()
    const hasLicense = await this.drivers.hasLicense(driverId, season)
    if (hasLicense) throw new DomainError('LICENSE_ALREADY_OWNED')
    await this.drivers.purchaseLicense(driverId, season)
  }

  async updateDriver(id: string, input: UpdateDriverInput): Promise<DriverRecord> {
    const driver = await this.drivers.findById(id)
    if (!driver) throw new DomainError('DRIVER_NOT_FOUND')
    return this.drivers.update(id, input)
  }

  async archiveDriver(id: string): Promise<DriverRecord> {
    const driver = await this.drivers.findById(id)
    if (!driver) throw new DomainError('DRIVER_NOT_FOUND')
    return this.drivers.update(id, { archived: true })
  }

  async unarchiveDriver(id: string): Promise<DriverRecord> {
    const driver = await this.drivers.findById(id)
    if (!driver) throw new DomainError('DRIVER_NOT_FOUND')
    return this.drivers.update(id, { archived: false })
  }

  async deleteDriver(id: string): Promise<void> {
    const driver = await this.drivers.findById(id)
    if (!driver) throw new DomainError('DRIVER_NOT_FOUND')
    await this.drivers.delete(id)
  }

  async listAll(): Promise<DriverRecord[]> {
    return this.drivers.findAll()
  }
}
