import type { IDriverRepository } from '@/repositories/interfaces/IDriverRepository'
import type { IChallengeRepository, ChallengeRecord } from '@/repositories/interfaces/IChallengeRepository'
import type { ISeasonRepository } from '@/repositories/interfaces/ISeasonRepository'
import type { IEloCalculator } from '@/domain/elo/EloCalculator'
import { ChallengeRules } from '@/domain/challenge/ChallengeRules'
import { DomainError } from '@/domain/errors/DomainError'

export interface CreateChallengeInput {
  player1Id: string
  player2Id: string
  stake: number
}

export class ChallengeService {
  private readonly rules = new ChallengeRules()

  constructor(
    private readonly drivers: IDriverRepository,
    private readonly challenges: IChallengeRepository,
    private readonly seasons: ISeasonRepository,
    private readonly elo: IEloCalculator,
  ) {}

  async createChallenge(input: CreateChallengeInput): Promise<ChallengeRecord> {
    if (input.player1Id === input.player2Id) {
      throw new DomainError('SAME_DRIVER')
    }

    const [p1, p2] = await Promise.all([
      this.drivers.findById(input.player1Id),
      this.drivers.findById(input.player2Id),
    ])
    if (!p1 || !p2) throw new DomainError('DRIVER_NOT_FOUND')

    const finance = this.rules.calculate({ stake: input.stake })
    const season = await this.seasons.getCurrentSeason()

    return this.challenges.create({
      season,
      player1Id: input.player1Id,
      player2Id: input.player2Id,
      stake: input.stake,
      totalPool: finance.totalPool,
      organizerFee: finance.organizerFee,
      winnerPrize: finance.winnerPrize,
    })
  }

  async resolveChallenge(
    challengeId: string,
    winnerId: string,
  ): Promise<ChallengeRecord> {
    const challenge = await this.challenges.findById(challengeId)
    if (!challenge) throw new DomainError('CHALLENGE_NOT_FOUND')

    if (challenge.player1Id !== winnerId && challenge.player2Id !== winnerId) {
      throw new DomainError('WINNER_NOT_PARTICIPANT')
    }

    const loserId =
      challenge.player1Id === winnerId ? challenge.player2Id : challenge.player1Id

    const [winner, loser] = await Promise.all([
      this.drivers.findById(winnerId),
      this.drivers.findById(loserId),
    ])
    if (!winner || !loser) throw new DomainError('DRIVER_NOT_FOUND')

    const eloResult = this.elo.calculate(winner.elo, loser.elo)

    await Promise.all([
      this.drivers.update(winner.id, {
        elo: eloResult.newWinnerElo,
        balance: winner.balance + challenge.winnerPrize,
      }),
      this.drivers.update(loser.id, {
        elo: eloResult.newLoserElo,
      }),
    ])

    return this.challenges.resolve(challengeId, winnerId)
  }

  async cancelChallenge(challengeId: string): Promise<ChallengeRecord> {
    return this.challenges.cancel(challengeId)
  }

  async activateChallenge(challengeId: string): Promise<ChallengeRecord> {
    return this.challenges.activate(challengeId)
  }

  async deleteChallenge(challengeId: string): Promise<void> {
    const challenge = await this.challenges.findById(challengeId)
    if (!challenge) throw new DomainError('CHALLENGE_NOT_FOUND')
    if (challenge.status === 'RESOLVED') throw new DomainError('CHALLENGE_ALREADY_RESOLVED')
    await this.challenges.delete(challengeId)
  }
}
