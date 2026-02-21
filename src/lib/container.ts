import { prisma } from '@/lib/prisma'
import { EloCalculator } from '@/domain/elo/EloCalculator'
import { PrismaDriverRepository } from '@/repositories/prisma/PrismaDriverRepository'
import { PrismaRaceRepository } from '@/repositories/prisma/PrismaRaceRepository'
import { PrismaChallengeRepository } from '@/repositories/prisma/PrismaChallengeRepository'
import { PrismaSeasonRepository } from '@/repositories/prisma/PrismaSeasonRepository'
import { PrismaCircuitRepository } from '@/repositories/prisma/PrismaCircuitRepository'
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

// ─── Domain ───────────────────────────────────────────────────────────────────
const eloCalculator = new EloCalculator()

// ─── Services ─────────────────────────────────────────────────────────────────
export const raceService = new RaceService(driverRepo, raceRepo, seasonRepo)
export const challengeService = new ChallengeService(driverRepo, challengeRepo, seasonRepo, eloCalculator)
export const driverService = new DriverService(driverRepo, seasonRepo)
export const seasonService = new SeasonService(driverRepo, seasonRepo)
export const circuitService = new CircuitService(circuitRepo)
