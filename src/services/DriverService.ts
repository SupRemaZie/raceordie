import type {
  IDriverRepository,
  DriverRecord,
  CreateDriverInput,
  UpdateDriverInput,
} from '@/repositories/interfaces/IDriverRepository'
import { DomainError } from '@/domain/errors/DomainError'

export class DriverService {
  constructor(
    private readonly drivers: IDriverRepository,
  ) {}

  async createDriver(input: CreateDriverInput): Promise<DriverRecord> {
    return this.drivers.create(input)
  }

  async getDriver(id: string): Promise<DriverRecord> {
    const driver = await this.drivers.findById(id)
    if (!driver) throw new DomainError('DRIVER_NOT_FOUND')
    return driver
  }

  async getRanking(): Promise<DriverRecord[]> {
    return this.drivers.findRanking()
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
