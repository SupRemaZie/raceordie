import Link from 'next/link'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface Driver { id: string; name: string }

interface RaceResult {
  id: string
  driverId: string
  position: number
  payout: number
  stake: number
  driver: Driver
}

interface RaceCardProps {
  race: {
    id: string
    name: string
    raceDate: string | Date
    season: number
    organizerFee: number
    commissionRate: number
    resolvedAt: string | null
    results: RaceResult[]
  }
}

const MEDAL: Record<number, string> = { 1: '🥇', 2: '🥈', 3: '🥉' }

export function RaceCard({ race }: RaceCardProps): React.JSX.Element {
  const isPending = !race.resolvedAt
  const totalPool = race.results.reduce((s, r) => s + r.stake, 0)

  const card = (
    <Card className={isPending ? 'border-primary/40 hover:border-primary cursor-pointer transition-colors' : ''}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-semibold leading-none">{race.name || `#${race.id.slice(0, 6)}`}</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {new Date(race.raceDate).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}
            </p>
          </div>
          <Badge variant={isPending ? 'secondary' : 'default'}>
            {isPending ? 'En attente' : 'Terminée'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {isPending ? (
          /* Pending: show participants */
          <div className="space-y-1">
            {race.results.map((r) => (
              <div key={r.id} className="flex justify-between text-sm">
                <span className="text-muted-foreground">{r.driver.name}</span>
                <span className="font-mono">${r.stake.toLocaleString()}</span>
              </div>
            ))}
            <p className="text-xs text-primary mt-2">Cliquer pour saisir le résultat →</p>
          </div>
        ) : (
          /* Finished: show podium */
          <div className="space-y-1">
            {race.results
              .filter((r) => r.position > 0 && r.position <= 3)
              .sort((a, b) => a.position - b.position)
              .map((r) => (
                <div key={r.id} className="flex items-center gap-2 text-sm">
                  <span>{MEDAL[r.position]}</span>
                  <span className="flex-1">{r.driver.name}</span>
                  <span className="font-mono text-green-500">+${r.payout.toLocaleString()}</span>
                </div>
              ))}
          </div>
        )}

        <div className="pt-2 border-t flex justify-between text-xs text-muted-foreground">
          <span>{(race.commissionRate * 100).toFixed(0)}% comm</span>
          <span>pool ${totalPool.toLocaleString()}</span>
        </div>
      </CardContent>
    </Card>
  )

  return isPending
    ? <Link href={`/races/${race.id}`}>{card}</Link>
    : card
}
