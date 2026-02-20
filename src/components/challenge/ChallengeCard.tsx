import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { MoneyDisplay } from '@/components/shared/MoneyDisplay'

type ChallengeStatus = 'PENDING' | 'ACTIVE' | 'RESOLVED' | 'CANCELLED'

interface ChallengeCardProps {
  challenge: {
    id: string
    player1Id: string
    player2Id: string
    stake: number
    totalPool: number
    winnerPrize: number
    status: ChallengeStatus
    winnerId: string | null
  }
}

const statusVariant: Record<ChallengeStatus, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  PENDING: 'outline',
  ACTIVE: 'secondary',
  RESOLVED: 'default',
  CANCELLED: 'destructive',
}

export function ChallengeCard({ challenge }: ChallengeCardProps): React.JSX.Element {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-mono text-muted-foreground">
            {challenge.id.slice(0, 8)}…
          </CardTitle>
          <Badge variant={statusVariant[challenge.status]}>
            {challenge.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Stake (each)</span>
          <MoneyDisplay amount={challenge.stake} />
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Prize pool</span>
          <MoneyDisplay amount={challenge.winnerPrize} />
        </div>
        {challenge.winnerId && (
          <div className="pt-2 text-xs text-muted-foreground">
            Winner: {challenge.winnerId.slice(0, 8)}…
          </div>
        )}
      </CardContent>
    </Card>
  )
}
