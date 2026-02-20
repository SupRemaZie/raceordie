import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { MoneyDisplay } from '@/components/shared/MoneyDisplay'

interface SeasonSummaryProps {
  stats: {
    season: number
    totalRaces: number
    totalChallenges: number
    finalPot: number
  }
}

export function SeasonSummary({ stats }: SeasonSummaryProps): React.JSX.Element {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-muted-foreground">Season</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold">#{stats.season}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-muted-foreground">Total Races</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold">{stats.totalRaces}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-muted-foreground">Challenges</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold">{stats.totalChallenges}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-muted-foreground">Final Pot</CardTitle>
        </CardHeader>
        <CardContent>
          <MoneyDisplay amount={stats.finalPot} className="text-3xl font-bold" />
        </CardContent>
      </Card>
    </div>
  )
}
