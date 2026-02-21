export interface CircuitRecord {
  id: string
  name: string
  checkpoints: string[]
  photos: string[]
  createdAt: Date
  updatedAt: Date
}

export interface CreateCircuitInput {
  name: string
  checkpoints: string[]
  photos: string[]
}

export interface ICircuitRepository {
  findAll(): Promise<CircuitRecord[]>
  findById(id: string): Promise<CircuitRecord | null>
  create(input: CreateCircuitInput): Promise<CircuitRecord>
  delete(id: string): Promise<void>
}
