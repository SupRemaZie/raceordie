import { PageHeader } from '@/components/shared/PageHeader'
import { SeasonSummary } from '@/components/season/SeasonSummary'
import { CloseSeasonButton } from '@/components/admin/CloseSeasonButton'
import { EloBadge } from '@/components/shared/EloBadge'
import { Badge } from '@/components/ui/badge'
import { seasonService, driverService } from '@/lib/container'
import { SeasonRewards } from '@/domain/season/SeasonRewards'

export default async function AdminSeasonPage(): Promise<React.JSX.Element> {
  const stats = await seasonService.getStats()
  const ranking = await driverService.getRanking()

  const top3 = ranking.slice(0, 3).map((d, idx) => ({
    id: d.id,
    position: idx + 1,
    elo: d.elo,
  }))

  const rewardsPreview = top3.length > 0 ? new SeasonRewards().calculate(top3) : []

  // Enrich preview with driver info
  const enriched = rewardsPreview.map((r) => {
    const driver = ranking.find((d) => d.id === r.driverId)
    return { ...r, tag: driver?.tag ?? '???', name: driver?.name ?? '' }
  })

  return (
    <div className="space-y-8">
      <PageHeader
        title="Season Management"
        description={`Current season: #${stats.season}`}
        action={<CloseSeasonButton rewardsPreview={rewardsPreview} />}
      />

      <SeasonSummary stats={stats} />

      {enriched.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-4">End-of-Season Rewards Preview</h2>
          <div className="space-y-3">
            {enriched.map((r, idx) => (
              <div
                key={r.driverId}
                className="flex items-center justify-between p-3 rounded-lg border"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl font-black text-muted-foreground w-8">
                    #{idx + 1}
                  </span>
                  <div>
                    <span className="font-mono font-bold">{r.tag}</span>
                    <span className="text-muted-foreground text-sm ml-2">{r.name}</span>
                  </div>
                  {r.title && <Badge variant="outline">{r.title}</Badge>}
                </div>
                <div className="flex items-center gap-4">
                  <EloBadge elo={ranking.find((d) => d.id === r.driverId)?.elo ?? 1000} />
                  {r.eloBonus > 0 && (
                    <span className="text-green-600 font-mono text-sm font-bold">
                      +{r.eloBonus} ELO next season
                    </span>
                  )}
                  {r.privilege && (
                    <span className="text-xs text-muted-foreground">{r.privilege}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {ranking.length === 0 && (
        <p className="text-muted-foreground">No drivers this season.</p>
      )}
    </div>
  )
}
