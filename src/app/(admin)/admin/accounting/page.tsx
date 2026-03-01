import { PageHeader } from '@/components/shared/PageHeader'
import { AdminStatCard } from '@/components/admin/AdminStatCard'
import { MoneyDisplay } from '@/components/shared/MoneyDisplay'
import { prisma } from '@/lib/prisma'
import { seasonService } from '@/lib/container'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

function fmt(n: number): React.JSX.Element {
  return <MoneyDisplay amount={n} />
}

export default async function AccountingPage(): Promise<React.JSX.Element> {
  const [raceAgg, challengeAgg, racesBySeason, challengesBySeason, seasonStats] = await Promise.all([
    // Toutes les courses résolues
    prisma.race.aggregate({
      where: { resolvedAt: { not: null } },
      _sum: { organizerFee: true, finalPotCut: true },
      _count: { id: true },
    }),
    // Tous les challenges résolus
    prisma.challenge.aggregate({
      where: { status: 'RESOLVED' },
      _sum: { organizerFee: true, totalPool: true },
      _count: { id: true },
    }),
    // Par saison — courses
    prisma.race.groupBy({
      by: ['season'],
      where: { resolvedAt: { not: null } },
      _sum: { organizerFee: true, finalPotCut: true },
      _count: { id: true },
      orderBy: { season: 'desc' },
    }),
    // Par saison — challenges
    prisma.challenge.groupBy({
      by: ['season'],
      where: { status: 'RESOLVED' },
      _sum: { organizerFee: true },
      _count: { id: true },
      orderBy: { season: 'desc' },
    }),
    seasonService.getStats(),
  ])

  const totalRaceFee = raceAgg._sum.organizerFee ?? 0
  const totalFinalPotCut = raceAgg._sum.finalPotCut ?? 0
  const netRaceRevenue = totalRaceFee - totalFinalPotCut

  const totalChallengeFee = challengeAgg._sum.organizerFee ?? 0
  const totalRevenue = netRaceRevenue + totalChallengeFee

  // Fusionner les saisons
  const allSeasons = Array.from(
    new Set([...racesBySeason.map((r) => r.season), ...challengesBySeason.map((c) => c.season)])
  ).sort((a, b) => b - a)

  const challengeBySeasonMap = new Map(challengesBySeason.map((c) => [c.season, c]))
  const raceBySeasonMap = new Map(racesBySeason.map((r) => [r.season, r]))

  return (
    <div>
      <PageHeader
        title="Comptabilité"
        description="Revenus et flux financiers de la plateforme"
      />

      {/* KPIs globaux */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <AdminStatCard
          label="Revenu net total"
          value={fmt(totalRevenue)}
          sub="courses + challenges"
        />
        <AdminStatCard
          label="Rev. courses (net)"
          value={fmt(netRaceRevenue)}
          sub={`${raceAgg._count.id} courses résolues`}
        />
        <AdminStatCard
          label="Rev. challenges"
          value={fmt(totalChallengeFee)}
          sub={`${challengeAgg._count.id} challenges résolus`}
        />
        <AdminStatCard
          label="Pot final (saison en cours)"
          value={fmt(seasonStats.finalPot)}
          sub={`Saison #${seasonStats.season}`}
        />
      </div>

      {/* Détail courses */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground font-normal uppercase tracking-widest">
              Détail courses
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Commission brute</span>
              <span className="font-mono">{fmt(totalRaceFee)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Mis en pot final (5%)</span>
              <span className="font-mono text-amber-400">− {fmt(totalFinalPotCut)}</span>
            </div>
            <div className="flex justify-between border-t border-border pt-2 font-medium">
              <span>Revenu net courses</span>
              <span className="font-mono text-primary">{fmt(netRaceRevenue)}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground font-normal uppercase tracking-widest">
              Détail challenges
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Pool total joué</span>
              <span className="font-mono">{fmt(challengeAgg._sum.totalPool ?? 0)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Commission prélevée</span>
              <span className="font-mono text-primary">{fmt(totalChallengeFee)}</span>
            </div>
            <div className="flex justify-between border-t border-border pt-2 font-medium">
              <span>Redistribué aux pilotes</span>
              <span className="font-mono">{fmt((challengeAgg._sum.totalPool ?? 0) - totalChallengeFee)}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tableau par saison */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-muted-foreground font-normal uppercase tracking-widest">
            Par saison
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Saison</TableHead>
                <TableHead className="text-right">Courses</TableHead>
                <TableHead className="text-right">Rev. courses</TableHead>
                <TableHead className="text-right">Challenges</TableHead>
                <TableHead className="text-right">Rev. challenges</TableHead>
                <TableHead className="text-right">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {allSeasons.map((season) => {
                const race = raceBySeasonMap.get(season)
                const challenge = challengeBySeasonMap.get(season)
                const raceFee = (race?._sum.organizerFee ?? 0) - (race?._sum.finalPotCut ?? 0)
                const challengeFee = challenge?._sum.organizerFee ?? 0
                return (
                  <TableRow key={season}>
                    <TableCell className="font-mono">#{season}</TableCell>
                    <TableCell className="text-right text-muted-foreground">{race?._count.id ?? 0}</TableCell>
                    <TableCell className="text-right font-mono">{fmt(raceFee)}</TableCell>
                    <TableCell className="text-right text-muted-foreground">{challenge?._count.id ?? 0}</TableCell>
                    <TableCell className="text-right font-mono">{fmt(challengeFee)}</TableCell>
                    <TableCell className="text-right font-mono font-medium text-primary">{fmt(raceFee + challengeFee)}</TableCell>
                  </TableRow>
                )
              })}
              {allSeasons.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                    Aucune donnée — résolvez des courses ou des challenges pour voir apparaître les revenus
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
