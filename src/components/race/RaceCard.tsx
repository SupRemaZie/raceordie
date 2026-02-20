import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { MoneyDisplay } from '@/components/shared/MoneyDisplay'

interface RaceResult {
  id: string
  driverId: string
  position: number
  payout: number
}

interface RaceCardProps {
  race: {
    id: string
    season: number
    organizerFee: number
    commissionRate: number
    resolvedAt: string | null
    results: RaceResult[]
  }
}

export function RaceCard({ race }: RaceCardProps): React.JSX.Element {
  const top3 = race.results
    .sort((a, b) => a.position - b.position)
    .slice(0, 3)

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-mono text-muted-foreground">
            {race.id.slice(0, 8)}…
          </CardTitle>
          <Badge variant={race.resolvedAt ? 'default' : 'secondary'}>
            {race.resolvedAt ? 'Resolved' : 'Pending'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-1">
          {top3.map((r) => (
            <div key={r.id} className="flex justify-between text-sm">
              <span>P{r.position}</span>
              <MoneyDisplay amount={r.payout} />
            </div>
          ))}
        </div>
        <div className="mt-3 pt-3 border-t flex justify-between text-xs text-muted-foreground">
          <span>Fee: {(race.commissionRate * 100).toFixed(0)}%</span>
          <MoneyDisplay amount={race.organizerFee} />
        </div>
      </CardContent>
    </Card>
  )
}
