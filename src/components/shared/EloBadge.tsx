import { Badge } from '@/components/ui/badge'

interface EloBadgeProps {
  elo: number
}

function getEloTier(elo: number): { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' } {
  if (elo >= 1300) return { label: 'Elite', variant: 'default' }
  if (elo >= 1100) return { label: 'Pro', variant: 'secondary' }
  if (elo >= 900) return { label: 'Rookie', variant: 'outline' }
  return { label: 'Farm', variant: 'destructive' }
}

export function EloBadge({ elo }: EloBadgeProps): React.JSX.Element {
  const tier = getEloTier(elo)
  return (
    <div className="flex items-center gap-2">
      <span className="font-mono font-semibold">{elo}</span>
      <Badge variant={tier.variant}>{tier.label}</Badge>
    </div>
  )
}
