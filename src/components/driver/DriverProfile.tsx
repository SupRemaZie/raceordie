import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { EloBadge } from '@/components/shared/EloBadge'
import { MoneyDisplay } from '@/components/shared/MoneyDisplay'

interface DriverProfileProps {
  driver: {
    id: string
    tag: string
    name: string
    elo: number
    balance: number
    createdAt: Date | string
  }
}

export function DriverProfile({ driver }: DriverProfileProps): React.JSX.Element {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <span className="font-mono text-2xl font-bold bg-muted px-3 py-1 rounded">
            {driver.tag}
          </span>
          <CardTitle className="text-2xl">{driver.name}</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-sm text-muted-foreground">ELO Rating</p>
          <EloBadge elo={driver.elo} />
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Balance</p>
          <MoneyDisplay amount={driver.balance} className="text-lg font-semibold" />
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Joined</p>
          <p className="text-sm">{new Date(driver.createdAt).toLocaleDateString()}</p>
        </div>
      </CardContent>
    </Card>
  )
}
