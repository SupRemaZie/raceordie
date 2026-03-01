export interface DriverRecord {
  id: string
  name: string
  elo: number
  balance: number
  archived: boolean
  userId: string | null
  createdAt: Date
  updatedAt: Date
}

export interface CreateDriverInput {
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
  findAll(): Promise<DriverRecord[]>
  findRanking(): Promise<DriverRecord[]>
}

// Segregated write interface (ISP)
export interface IDriverWriter {
  create(input: CreateDriverInput): Promise<DriverRecord>
  update(id: string, input: UpdateDriverInput): Promise<DriverRecord>
  delete(id: string): Promise<void>
}

// Full repository interface for DI
export interface IDriverRepository extends IDriverReader, IDriverWriter {}
