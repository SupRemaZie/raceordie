import { prisma } from '@/lib/prisma'
import { EloCalculator } from '@/domain/elo/EloCalculator'
import { PrismaDriverRepository } from '@/repositories/prisma/PrismaDriverRepository'
import { PrismaRaceRepository } from '@/repositories/prisma/PrismaRaceRepository'
import { PrismaChallengeRepository } from '@/repositories/prisma/PrismaChallengeRepository'
import { PrismaSeasonRepository } from '@/repositories/prisma/PrismaSeasonRepository'
import { RaceService } from '@/services/RaceService'
import { ChallengeService } from '@/services/ChallengeService'
import { DriverService } from '@/services/DriverService'
import { SeasonService } from '@/services/SeasonService'

// ─── Repositories ────────────────────────────────────────────────────────────
const driverRepo = new PrismaDriverRepository(prisma)
const raceRepo = new PrismaRaceRepository(prisma)
const challengeRepo = new PrismaChallengeRepository(prisma)
const seasonRepo = new PrismaSeasonRepository(prisma)

// ─── Domain ───────────────────────────────────────────────────────────────────
const eloCalculator = new EloCalculator()

// ─── Services ─────────────────────────────────────────────────────────────────
export const raceService = new RaceService(driverRepo, raceRepo, seasonRepo, eloCalculator)
export const challengeService = new ChallengeService(driverRepo, challengeRepo, seasonRepo, eloCalculator)
export const driverService = new DriverService(driverRepo, seasonRepo)
export const seasonService = new SeasonService(driverRepo, seasonRepo)
