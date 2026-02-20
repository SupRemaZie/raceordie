import { DomainError } from '@/domain/errors/DomainError'
import type { SeasonDriver, SeasonRewardResult } from './types'

export const KING_ELO_BONUS = 50
export const NIGHT_PREDATOR_ELO_BONUS = 25

export class SeasonRewards {
  calculate(drivers: SeasonDriver[]): SeasonRewardResult[] {
    if (drivers.length === 0) {
      throw new DomainError('NO_DRIVERS')
    }

    const sorted = [...drivers].sort((a, b) => a.position - b.position)

    return sorted.map((driver): SeasonRewardResult => {
      switch (driver.position) {
        case 1:
          return {
            driverId: driver.id,
            title: 'King of the Streets',
            eloBonus: KING_ELO_BONUS,
            prizePoolCutMin: 60,
            prizePoolCutMax: 70,
            privilege: 'Can run VIP races',
          }
        case 2:
          return {
            driverId: driver.id,
            title: 'Elite Runner',
            eloBonus: 0,
            prizePoolCutMin: 20,
            prizePoolCutMax: 25,
            privilege: '-50% buy-in next season',
          }
        case 3:
          return {
            driverId: driver.id,
            title: 'Night Predator',
            eloBonus: NIGHT_PREDATOR_ELO_BONUS,
            prizePoolCutMin: 10,
            prizePoolCutMax: 15,
            privilege: null,
          }
        default:
          return {
            driverId: driver.id,
            title: null,
            eloBonus: 0,
            prizePoolCutMin: 0,
            prizePoolCutMax: 0,
            privilege: null,
          }
      }
    })
  }
}
