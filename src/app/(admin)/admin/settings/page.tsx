import { PageHeader } from '@/components/shared/PageHeader'
import { RankingConfigForm } from '@/components/admin/RankingConfigForm'
import { prisma } from '@/lib/prisma'

export default async function AdminSettingsPage(): Promise<React.JSX.Element> {
  const config = await prisma.rankingConfig.findUnique({ where: { id: 1 } })

  const initialValues = config
    ? {
        eloFloor: config.eloFloor,
        diffThreshold: config.diffThreshold,
        strongWinDelta: config.strongWinDelta,
        strongLossDelta: config.strongLossDelta,
        evenWinDelta: config.evenWinDelta,
        evenLossDelta: config.evenLossDelta,
        weakWinDelta: config.weakWinDelta,
        weakLossDelta: config.weakLossDelta,
        racePoints1: config.racePoints1,
        racePoints2: config.racePoints2,
        racePoints3: config.racePoints3,
        racePointsOther: config.racePointsOther,
      }
    : undefined

  return (
    <div>
      <PageHeader
        title="Settings"
        description="Paramètres du système de ranking"
      />

      <div className="max-w-2xl mb-8 space-y-3 text-sm text-muted-foreground leading-relaxed">
        <p>
          Ces paramètres contrôlent le calcul des points ELO et les points de course attribués à chaque pilote après un résultat.
          Les modifications prennent effet <span className="text-foreground font-medium">immédiatement</span> sur tous les prochains résultats résolus — aucun redémarrage requis.
        </p>
        <ul className="space-y-1.5 list-none">
          <li className="flex gap-2">
            <span className="text-primary font-mono shrink-0">—</span>
            <span><span className="text-foreground font-medium">Plancher ELO :</span> valeur minimale en dessous de laquelle aucun pilote ne peut descendre, quelle que soit sa série de défaites.</span>
          </li>
          <li className="flex gap-2">
            <span className="text-primary font-mono shrink-0">—</span>
            <span><span className="text-foreground font-medium">Seuil d&apos;écart ELO :</span> si l&apos;écart entre les deux pilotes dépasse ce seuil, le palier &quot;Favori battu&quot; ou &quot;Faible battu&quot; s&apos;applique, sinon c&apos;est le palier &quot;Équilibré&quot;.</span>
          </li>
          <li className="flex gap-2">
            <span className="text-primary font-mono shrink-0">—</span>
            <span><span className="text-foreground font-medium">Deltas ELO challenges :</span> le gagnant gagne +delta, le perdant perd −delta. Les deltas sont distincts selon le palier.</span>
          </li>
          <li className="flex gap-2">
            <span className="text-primary font-mono shrink-0">—</span>
            <span><span className="text-foreground font-medium">Points course :</span> points ELO ajoutés selon la position finale dans une course (1er, 2e, 3e, ou autres places).</span>
          </li>
        </ul>
      </div>

      <RankingConfigForm initialValues={initialValues} />
    </div>
  )
}
