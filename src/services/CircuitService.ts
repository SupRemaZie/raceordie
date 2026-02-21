import type { ICircuitRepository, CircuitRecord } from '@/repositories/interfaces/ICircuitRepository'
import { DomainError } from '@/domain/errors/DomainError'

export interface CreateCircuitServiceInput {
  name: string
  checkpoints: string[]
  photos: string[]
}

export interface UpdateCircuitServiceInput {
  name?: string
  checkpoints?: string[]
  photos?: string[]
}

export class CircuitService {
  constructor(readonly circuits: ICircuitRepository) {}

  async listCircuits(): Promise<CircuitRecord[]> {
    return this.circuits.findAll()
  }

  async getCircuit(id: string): Promise<CircuitRecord> {
    const circuit = await this.circuits.findById(id)
    if (!circuit) throw new DomainError('CIRCUIT_NOT_FOUND')
    return circuit
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

  async updateCircuit(id: string, input: UpdateCircuitServiceInput): Promise<CircuitRecord> {
    const circuit = await this.circuits.findById(id)
    if (!circuit) throw new DomainError('CIRCUIT_NOT_FOUND')
    return this.circuits.update(id, {
      name: input.name ?? circuit.name,
      checkpoints: input.checkpoints ?? circuit.checkpoints,
      photos: input.photos ?? circuit.photos,
    })
  }

  async deleteCircuit(id: string): Promise<void> {
    const circuit = await this.circuits.findById(id)
    if (!circuit) throw new DomainError('CIRCUIT_NOT_FOUND')
    await this.circuits.delete(id)
  }
}
