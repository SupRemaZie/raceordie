import type { IDriverRepository } from '@/repositories/interfaces/IDriverRepository'
import type { IRaceRepository } from '@/repositories/interfaces/IRaceRepository'
import type { ISeasonRepository } from '@/repositories/interfaces/ISeasonRepository'
import type { IEloCalculator } from '@/domain/elo/EloCalculator'
import { RaceFinance } from '@/domain/race/RaceFinance'
import type { CommissionRate } from '@/domain/race/types'
import { DomainError } from '@/domain/errors/DomainError'

export interface ResolveRaceInput {
  finishedOrder: string[] // driver IDs, 1st to last
  stakes: number[]
  commissionRate: CommissionRate
}

export class RaceService {
  private readonly finance = new RaceFinance()

  constructor(
    private readonly drivers: IDriverRepository,
    private readonly races: IRaceRepository,
    private readonly seasons: ISeasonRepository,
    private readonly elo: IEloCalculator,
  ) {}

  async resolveRace(input: ResolveRaceInput): Promise<string> {
    if (input.finishedOrder.length < 3) {
      throw new DomainError('INSUFFICIENT_DRIVERS')
    }
    if (input.finishedOrder.length !== input.stakes.length) {
      throw new DomainError('STAKES_MISMATCH')
    }

    const financeResult = this.finance.calculate({
      stakes: input.stakes,
      commissionRate: input.commissionRate,
    })

    const season = await this.seasons.getCurrentSeason()

    // Build payout map: position → amount
    const payouts: Record<number, number> = {
      1: financeResult.payouts.first,
      2: financeResult.payouts.second,
      3: financeResult.payouts.third,
    }

    const results = input.finishedOrder.map((driverId, idx) => ({
      driverId,
      position: idx + 1,
      payout: payouts[idx + 1] ?? 0,
    }))

    // Persist race
    const race = await this.races.create({
      season,
      organizerFee: financeResult.organizerFee,
      finalPotCut: financeResult.finalPotContribution,
      commissionRate: input.commissionRate,
      results,
    })

    // Update balances & ELO (winner = 1st place, iterate pairwise for ELO)
    // Pay out drivers
    for (const result of results) {
      const payout = result.payout
      if (payout > 0) {
        await this.drivers.update(result.driverId, {
          balance: (await this.drivers.findById(result.driverId))!.balance + payout,
        })
      }
    }

    // Update ELO: 1st beats everyone below, 2nd beats 3rd+, etc.
    const winner = await this.drivers.findById(input.finishedOrder[0])
    const second = await this.drivers.findById(input.finishedOrder[1])
    if (!winner || !second) throw new DomainError('DRIVER_NOT_FOUND')

    // Apply ELO between consecutive positions
    for (let i = 0; i < input.finishedOrder.length - 1; i++) {
      const higher = await this.drivers.findById(input.finishedOrder[i])
      const lower = await this.drivers.findById(input.finishedOrder[i + 1])
      if (!higher || !lower) continue

      const eloResult = this.elo.calculate(higher.elo, lower.elo)
      await this.drivers.update(higher.id, { elo: eloResult.newWinnerElo })
      await this.drivers.update(lower.id, { elo: eloResult.newLoserElo })
    }

    return race.id
  }
}
