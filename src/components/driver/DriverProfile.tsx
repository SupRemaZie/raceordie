import Image from 'next/image'
import { MoneyDisplay } from '@/components/shared/MoneyDisplay'

interface DriverProfileProps {
  driver: {
    id: string
    tag: string
    name: string
    elo: number
    balance: number
    archived: boolean
    photo?: string | null
    createdAt: Date | string
  }
  rank?: number
  total?: number
}

interface EloTier {
  label: string
  min: number
  max: number
  color: string
  glowClass: string
}

const ELO_TIERS: EloTier[] = [
  { label: 'ELITE',  min: 1300, max: 1600, color: 'oklch(0.65 0.30 22)',  glowClass: 'glow-text' },
  { label: 'PRO',    min: 1100, max: 1300, color: 'oklch(0.78 0.20 55)',  glowClass: '' },
  { label: 'ROOKIE', min: 900,  max: 1100, color: 'oklch(0.65 0.18 240)', glowClass: '' },
  { label: 'FARM',   min: 800,  max: 900,  color: 'oklch(0.45 0.02 0)',   glowClass: '' },
]

function getEloTier(elo: number): EloTier {
  return ELO_TIERS.find((t) => elo >= t.min) ?? ELO_TIERS[ELO_TIERS.length - 1]
}

function getEloProgress(elo: number, tier: EloTier): number {
  const range = tier.max - tier.min
  const progress = Math.min(elo - tier.min, range)
  return Math.round((progress / range) * 100)
}

const RANK_TITLES: Record<number, { label: string; medal: string; cardClass: string }> = {
  1: { label: 'King of the Streets', medal: '👑', cardClass: 'podium-gold' },
  2: { label: 'Elite Runner',        medal: '🥈', cardClass: 'podium-silver' },
  3: { label: 'Night Predator',      medal: '🥉', cardClass: 'podium-bronze' },
}

export function DriverProfile({ driver, rank, total }: DriverProfileProps): React.JSX.Element {
  const tier = getEloTier(driver.elo)
  const progress = getEloProgress(driver.elo, tier)
  const rankTitle = rank ? RANK_TITLES[rank] : undefined
  const isRanked = rank && rank > 0

  return (
    <div className="space-y-4">
      {/* ── Hero card ─────────────────────────────────────────── */}
      <div className={`card-glass rounded-2xl overflow-hidden ${rankTitle?.cardClass ?? ''}`}>
        {/* Stripe top */}
        <div className="racing-stripe h-1 w-full" />

        <div className="px-8 py-7">
          <div className="flex items-start justify-between gap-6">
            {/* Identity */}
            <div className="flex items-start gap-4 min-w-0">
              {/* Avatar */}
              <div className="shrink-0 w-24 h-24 rounded-full overflow-hidden border-2 border-border bg-muted flex items-center justify-center" style={{ position: 'relative' }}>
                {driver.photo ? (
                  <Image src={driver.photo} alt={driver.name} fill className="object-cover" />
                ) : (
                  <span
                    className="text-3xl font-black select-none"
                    style={{ color: tier.color }}
                  >
                    {driver.name.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
              <div className="min-w-0">
              {/* Rank / title */}
              {driver.archived ? (
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-[10px] font-mono tracking-widest uppercase text-muted-foreground border border-border px-2 py-0.5 rounded">
                    ARCHIVÉ
                  </span>
                </div>
              ) : isRanked ? (
                <div className="flex items-center gap-2 mb-3">
                  {rankTitle ? (
                    <>
                      <span className="text-base leading-none">{rankTitle.medal}</span>
                      <span
                        className="text-[10px] font-mono tracking-widest uppercase"
                        style={{ color: tier.color }}
                      >
                        #{rank} — {rankTitle.label}
                      </span>
                    </>
                  ) : (
                    <span className="text-[10px] font-mono tracking-widest uppercase text-muted-foreground">
                      #{rank} / {total} — classement actif
                    </span>
                  )}
                </div>
              ) : null}

              {/* Name */}
              <h1
                className="text-4xl font-black uppercase tracking-tight leading-none truncate"
                style={{ fontFamily: 'var(--font-orbitron)' }}
              >
                {driver.name}
              </h1>
              </div>
            </div>

            {/* Tag pill */}
            <div
              className="shrink-0 font-mono text-xl font-black px-4 py-2 rounded-lg border tracking-widest"
              style={{
                color: tier.color,
                borderColor: `${tier.color}50`,
                background: `${tier.color}10`,
              }}
            >
              {driver.tag}
            </div>
          </div>

          {/* ELO bar */}
          <div className="mt-6">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] font-mono tracking-widest uppercase text-muted-foreground">
                ELO Rating
              </span>
              <span
                className="text-[10px] font-mono tracking-widest uppercase font-bold"
                style={{ color: tier.color }}
              >
                {tier.label}
              </span>
            </div>
            <div className="flex items-center gap-4">
              <span
                className={`text-5xl font-black tabular-nums leading-none ${tier.glowClass}`}
                style={{ fontFamily: 'var(--font-orbitron)', color: tier.color }}
              >
                {driver.elo}
              </span>
              <div className="flex-1">
                <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{
                      width: `${progress}%`,
                      background: `linear-gradient(to right, ${tier.color}80, ${tier.color})`,
                    }}
                  />
                </div>
                <div className="flex justify-between mt-1">
                  <span className="text-[9px] font-mono text-muted-foreground/60">{tier.min}</span>
                  <span className="text-[9px] font-mono text-muted-foreground/60">{tier.max}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Stats row ─────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-3">
        <div className="card-glass rounded-xl px-5 py-4">
          <p className="text-[10px] font-mono tracking-widest uppercase text-muted-foreground mb-1">
            Balance
          </p>
          <MoneyDisplay
            amount={driver.balance}
            className="text-2xl font-black text-green-400 tabular-nums"
          />
        </div>
        <div className="card-glass rounded-xl px-5 py-4">
          <p className="text-[10px] font-mono tracking-widest uppercase text-muted-foreground mb-1">
            Membre depuis
          </p>
          <p className="text-2xl font-black tabular-nums" style={{ fontFamily: 'var(--font-orbitron)' }}>
            {new Date(driver.createdAt).toLocaleDateString('fr-FR', {
              month: 'short',
              year: 'numeric',
            }).toUpperCase()}
          </p>
        </div>
      </div>
    </div>
  )
}
