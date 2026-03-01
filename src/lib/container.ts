import { prisma } from '@/lib/prisma'
import { PrismaDriverRepository } from '@/repositories/prisma/PrismaDriverRepository'
import { PrismaRaceRepository } from '@/repositories/prisma/PrismaRaceRepository'
import { PrismaChallengeRepository } from '@/repositories/prisma/PrismaChallengeRepository'
import { PrismaSeasonRepository } from '@/repositories/prisma/PrismaSeasonRepository'
import { PrismaCircuitRepository } from '@/repositories/prisma/PrismaCircuitRepository'
import { PrismaRankingConfigRepository } from '@/repositories/prisma/PrismaRankingConfigRepository'
import { RaceService } from '@/services/RaceService'
import { ChallengeService } from '@/services/ChallengeService'
import { DriverService } from '@/services/DriverService'
import { SeasonService } from '@/services/SeasonService'
import { CircuitService } from '@/services/CircuitService'

// ─── Repositories ────────────────────────────────────────────────────────────
const driverRepo = new PrismaDriverRepository(prisma)
const raceRepo = new PrismaRaceRepository(prisma)
const challengeRepo = new PrismaChallengeRepository(prisma)
const seasonRepo = new PrismaSeasonRepository(prisma)
const circuitRepo = new PrismaCircuitRepository(prisma)
export const rankingConfigRepo = new PrismaRankingConfigRepository(prisma)

// ─── Services ─────────────────────────────────────────────────────────────────
export const raceService = new RaceService(driverRepo, raceRepo, seasonRepo, rankingConfigRepo)
export const challengeService = new ChallengeService(driverRepo, challengeRepo, seasonRepo, rankingConfigRepo)
export const driverService = new DriverService(driverRepo)
export const seasonService = new SeasonService(driverRepo, seasonRepo)
export const circuitService = new CircuitService(circuitRepo)
