import type { ICircuitRepository, CircuitRecord } from '@/repositories/interfaces/ICircuitRepository'
import { DomainError } from '@/domain/errors/DomainError'

export interface CreateCircuitServiceInput {
  name: string
  checkpoints: string[]
  photos: string[]
}

export class CircuitService {
  constructor(private readonly circuits: ICircuitRepository) {}

  async listCircuits(): Promise<CircuitRecord[]> {
    return this.circuits.findAll()
  }

  async createCircuit(input: CreateCircuitServiceInput): Promise<CircuitRecord> {
    if (!input.name.trim()) throw new DomainError('CIRCUIT_NAME_REQUIRED')
    if (input.checkpoints.length > 6) throw new DomainError('TOO_MANY_CHECKPOINTS')
    return this.circuits.create({
      name: input.name.trim(),
      checkpoints: input.checkpoints.filter((c) => c.trim()),
      photos: input.photos,
    })
  }

  async deleteCircuit(id: string): Promise<void> {
    const circuit = await this.circuits.findById(id)
    if (!circuit) throw new DomainError('CIRCUIT_NOT_FOUND')
    await this.circuits.delete(id)
  }
}
