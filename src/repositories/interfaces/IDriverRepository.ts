export interface DriverRecord {
  id: string
  tag: string
  name: string
  elo: number
  balance: number
  archived: boolean
  userId: string | null
  createdAt: Date
  updatedAt: Date
}

export interface CreateDriverInput {
  tag: string
  name: string
  userId?: string
}

export interface UpdateDriverInput {
  name?: string
  elo?: number
  balance?: number
  archived?: boolean
}

// Segregated read interface (ISP)
export interface IDriverReader {
  findById(id: string): Promise<DriverRecord | null>
  findByTag(tag: string): Promise<DriverRecord | null>
  findAll(): Promise<DriverRecord[]>
  findRanking(season: number): Promise<DriverRecord[]>
}

// Segregated write interface (ISP)
export interface IDriverWriter {
  create(input: CreateDriverInput): Promise<DriverRecord>
  update(id: string, input: UpdateDriverInput): Promise<DriverRecord>
  delete(id: string): Promise<void>
}

// License operations (ISP)
export interface IDriverLicense {
  hasLicense(driverId: string, season: number): Promise<boolean>
  purchaseLicense(driverId: string, season: number): Promise<void>
  revokeAllLicenses(season: number): Promise<void>
}

// Full repository interface for DI
export interface IDriverRepository extends IDriverReader, IDriverWriter, IDriverLicense {}
