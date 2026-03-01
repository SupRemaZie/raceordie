interface EloTier {
  label: string
  color: string
  bg: string
  border: string
}

function getEloTier(elo: number): EloTier {
  if (elo >= 1300) return {
    label: 'ELITE',
    color: 'oklch(0.65 0.30 22)',
    bg: 'oklch(0.65 0.30 22 / 0.10)',
    border: 'oklch(0.65 0.30 22 / 0.40)',
  }
  if (elo >= 1100) return {
    label: 'PRO',
    color: 'oklch(0.78 0.20 55)',
    bg: 'oklch(0.78 0.20 55 / 0.10)',
    border: 'oklch(0.78 0.20 55 / 0.40)',
  }
  if (elo >= 900) return {
    label: 'ROOKIE',
    color: 'oklch(0.65 0.18 240)',
    bg: 'oklch(0.65 0.18 240 / 0.10)',
    border: 'oklch(0.65 0.18 240 / 0.40)',
  }
  return {
    label: 'FARM',
    color: 'oklch(0.50 0.02 0)',
    bg: 'oklch(0.50 0.02 0 / 0.10)',
    border: 'oklch(0.50 0.02 0 / 0.30)',
  }
}

interface EloBadgeProps {
  elo: number
}

export function EloBadge({ elo }: EloBadgeProps): React.JSX.Element {
  const tier = getEloTier(elo)
  return (
    <div className="flex items-center gap-2">
      <span
        className="font-mono font-bold tabular-nums text-sm"
        style={{ color: tier.color }}
      >
        {elo}
      </span>
      <span
        className="text-[9px] font-mono font-bold tracking-widest px-1.5 py-0.5 rounded border"
        style={{ color: tier.color, background: tier.bg, borderColor: tier.border }}
      >
        {tier.label}
      </span>
    </div>
  )
}
