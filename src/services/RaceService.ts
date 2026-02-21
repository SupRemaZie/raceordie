import type { IDriverRepository } from '@/repositories/interfaces/IDriverRepository'
import type { IRaceRepository } from '@/repositories/interfaces/IRaceRepository'
import type { ISeasonRepository } from '@/repositories/interfaces/ISeasonRepository'
import { ELO_FLOOR } from '@/domain/elo/EloCalculator'
import { RaceFinance } from '@/domain/race/RaceFinance'
import type { CommissionRate } from '@/domain/race/types'
import { DomainError } from '@/domain/errors/DomainError'

const RACE_POINTS: Record<number, number> = { 1: 100, 2: 50, 3: 30 }
const RACE_POINTS_DEFAULT = 10

export interface CreatePendingRaceInput {
  name: string
  raceDate: Date
  checkpoints: string[]
  participants: Array<{ driverId: string; stake: number }>
  commissionRate: CommissionRate
  circuitId?: string | null
}

export interface FinishRaceInput {
  raceId: string
  top3: string[] // driverIds: [1st, 2nd, 3rd]
}

export class RaceService {
  private readonly finance = new RaceFinance()

  constructor(
    private readonly drivers: IDriverRepository,
    private readonly races: IRaceRepository,
    private readonly seasons: ISeasonRepository,
  ) {}

  async createPendingRace(input: CreatePendingRaceInput): Promise<string> {
    if (input.participants.length < 2) throw new DomainError('INSUFFICIENT_DRIVERS')

    const stakes = input.participants.map((p) => p.stake)
    const totalPool = stakes.reduce((s, x) => s + x, 0)
    const organizerFee = Math.floor(totalPool * input.commissionRate)
    const finalPotCut = Math.floor(organizerFee * 0.05)

    const season = await this.seasons.getCurrentSeason()
    const race = await this.races.create({
      name: input.name,
      raceDate: input.raceDate,
      checkpoints: input.checkpoints,
      season,
      organizerFee,
      finalPotCut,
      commissionRate: input.commissionRate,
      circuitId: input.circuitId ?? null,
      participants: input.participants,
    })
    return race.id
  }

  async deleteRace(id: string): Promise<void> {
    const race = await this.races.findById(id)
    if (!race) throw new DomainError('RACE_NOT_FOUND')
    if (race.resolvedAt) throw new DomainError('RACE_ALREADY_RESOLVED')
    await this.races.delete(id)
  }

  async finishRace(input: FinishRaceInput): Promise<void> {
    if (input.top3.length !== 3) throw new DomainError('INVALID_TOP3')

    const race = await this.races.findById(input.raceId)
    if (!race) throw new DomainError('RACE_NOT_FOUND')
    if (race.resolvedAt) throw new DomainError('RACE_ALREADY_RESOLVED')

    const participants = race.results
    const allIds = participants.map((r) => r.driverId)

    if (!input.top3.every((id) => allIds.includes(id))) {
      throw new DomainError('DRIVER_NOT_IN_RACE')
    }

    // Finance
    const stakes = participants.map((r) => r.stake)
    const totalPool = stakes.reduce((s, x) => s + x, 0)
    const organizerFee = Math.floor(totalPool * race.commissionRate)
    const prizePool = totalPool - organizerFee

    const payoutByPosition: Record<number, number> = {
      1: Math.floor(prizePool * 0.6),
      2: Math.floor(prizePool * 0.25),
      3: Math.floor(prizePool * 0.15),
    }

    // Build position map
    const positionOf: Record<string, number> = {}
    input.top3.forEach((id, i) => { positionOf[id] = i + 1 })
    allIds.forEach((id) => { if (!positionOf[id]) positionOf[id] = 4 })

    // Persist results
    const results = allIds.map((driverId) => ({
      driverId,
      position: positionOf[driverId],
      payout: payoutByPosition[positionOf[driverId]] ?? 0,
    }))
    await this.races.updateResults(input.raceId, results)

    // Update drivers balance + ELO
    for (const r of results) {
      const driver = await this.drivers.findById(r.driverId)
      if (!driver) continue
      const points = RACE_POINTS[r.position] ?? RACE_POINTS_DEFAULT
      await this.drivers.update(r.driverId, {
        balance: driver.balance + r.payout,
        elo: Math.max(ELO_FLOOR, driver.elo + points),
      })
    }
  }
}
