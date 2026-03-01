import Link from 'next/link'
import Image from 'next/image'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { MoneyDisplay } from '@/components/shared/MoneyDisplay'

interface Driver {
  id: string
  tag: string
  name: string
  elo: number
  balance: number
  photo?: string | null
}

interface RankingTableProps {
  drivers: Driver[]
  showBalance?: boolean
}

const PODIUM_CONFIG = [
  {
    pos: 1,
    title: 'King of the Streets',
    medal: '👑',
    cardClass: 'podium-gold',
    labelClass: 'text-amber-400',
    eloClass: 'glow-text-amber',
    bgClass: 'bg-amber-500/5',
  },
  {
    pos: 2,
    title: 'Elite Runner',
    medal: '🥈',
    cardClass: 'podium-silver',
    labelClass: 'text-zinc-300',
    eloClass: '',
    bgClass: 'bg-zinc-400/5',
  },
  {
    pos: 3,
    title: 'Night Predator',
    medal: '🥉',
    cardClass: 'podium-bronze',
    labelClass: 'text-amber-600',
    eloClass: '',
    bgClass: 'bg-amber-700/5',
  },
] as const

export function RankingTable({ drivers, showBalance = true }: RankingTableProps): React.JSX.Element {
  const top3 = drivers.slice(0, 3)

  return (
    <div className="space-y-8">
      {/* Podium Section */}
      {top3.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {PODIUM_CONFIG.map((cfg) => {
            const driver = drivers[cfg.pos - 1]
            if (!driver) return null

            return (
              <div
                key={cfg.pos}
                className={`card-glass ${cfg.cardClass} ${cfg.bgClass} rounded-xl p-5 transition-all duration-200`}
              >
                {/* Medal + title */}
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p className={`text-[10px] font-mono tracking-widest uppercase ${cfg.labelClass} mb-1`}>
                      #{cfg.pos} — {cfg.title}
                    </p>
                    <Link
                      href={`/drivers/${driver.id}`}
                      className="text-lg font-black uppercase tracking-tight hover:text-primary transition-colors"
                      style={{ fontFamily: 'var(--font-orbitron)' }}
                    >
                      {driver.name}
                    </Link>
                  </div>
                  {/* Avatar or medal */}
                  <div className="shrink-0 w-14 h-14 rounded-full overflow-hidden border border-border bg-muted flex items-center justify-center" style={{ position: 'relative' }}>
                    {driver.photo ? (
                      <Image src={driver.photo} alt={driver.name} fill className="object-cover" />
                    ) : (
                      <span className="text-2xl leading-none">{cfg.medal}</span>
                    )}
                  </div>
                </div>

                {/* ELO */}
                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-[10px] text-muted-foreground font-mono tracking-widest uppercase mb-0.5">
                      ELO Rating
                    </p>
                    <p
                      className={`text-3xl font-black tabular-nums leading-none ${cfg.eloClass}`}
                      style={{ fontFamily: 'var(--font-orbitron)' }}
                    >
                      {driver.elo}
                    </p>
                  </div>
                  {showBalance && (
                    <div className="text-right">
                      <p className="text-[10px] text-muted-foreground font-mono tracking-widest uppercase mb-0.5">
                        Balance
                      </p>
                      <MoneyDisplay amount={driver.balance} className="text-sm font-semibold" />
                    </div>
                  )}
                </div>

                {/* Tag badge */}
                <div className="mt-3 pt-3 border-t border-white/5">
                  <span className="font-mono text-xs text-muted-foreground tracking-widest">
                    [{driver.tag}]
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Full ranking table */}
      {drivers.length > 0 ? (
        <div className="rounded-xl border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                <TableHead className="w-12 text-muted-foreground font-mono text-xs tracking-widest uppercase">#</TableHead>
                <TableHead className="text-muted-foreground font-mono text-xs tracking-widest uppercase">Driver</TableHead>
                <TableHead className="text-muted-foreground font-mono text-xs tracking-widest uppercase">ELO</TableHead>
                {showBalance && (
                  <TableHead className="text-muted-foreground font-mono text-xs tracking-widest uppercase">Balance</TableHead>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {drivers.map((driver, idx) => {
                const pos = idx + 1
                const isTop3 = pos <= 3
                const medals: Record<number, string> = { 1: '👑', 2: '🥈', 3: '🥉' }

                const rowClass = isTop3
                  ? pos === 1
                    ? 'bg-amber-500/5 border-l-2 border-amber-500/60'
                    : pos === 2
                      ? 'bg-zinc-400/5 border-l-2 border-zinc-500/40'
                      : 'bg-amber-700/5 border-l-2 border-amber-700/40'
                  : ''

                return (
                  <TableRow key={driver.id} className={`${rowClass} border-border`}>
                    <TableCell className="font-mono text-muted-foreground">
                      {isTop3
                        ? <span>{medals[pos]}</span>
                        : <span className="text-muted-foreground/60 text-xs">{pos}</span>
                      }
                    </TableCell>
                    <TableCell>
                      <Link
                        href={`/drivers/${driver.id}`}
                        className={`hover:text-primary transition-colors font-semibold ${isTop3 ? 'text-base' : 'text-sm'}`}
                      >
                        {driver.name}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <span
                        className={`font-mono font-bold tabular-nums ${isTop3 ? 'text-base' : 'text-sm'} ${pos === 1 ? 'glow-text-amber text-amber-400' : ''}`}
                        style={isTop3 ? { fontFamily: 'var(--font-orbitron)' } : undefined}
                      >
                        {driver.elo}
                      </span>
                    </TableCell>
                    {showBalance && (
                      <TableCell>
                        <MoneyDisplay amount={driver.balance} />
                      </TableCell>
                    )}
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="rounded-xl border border-border py-16 text-center text-muted-foreground text-sm font-mono tracking-widest uppercase">
          No drivers yet
        </div>
      )}
    </div>
  )
}
