import type { PrismaClient } from '@prisma/client'
import type {
  ICircuitRepository,
  CircuitRecord,
  CreateCircuitInput,
} from '@/repositories/interfaces/ICircuitRepository'

export class PrismaCircuitRepository implements ICircuitRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findAll(): Promise<CircuitRecord[]> {
    return this.prisma.circuit.findMany({ orderBy: { name: 'asc' } })
  }

  async findById(id: string): Promise<CircuitRecord | null> {
    return this.prisma.circuit.findUnique({ where: { id } })
  }

  async create(input: CreateCircuitInput): Promise<CircuitRecord> {
    return this.prisma.circuit.create({ data: input })
  }

  async delete(id: string): Promise<void> {
    await this.prisma.circuit.delete({ where: { id } })
  }
}
