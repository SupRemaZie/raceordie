'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { EloBadge } from '@/components/shared/EloBadge'
import { MoneyDisplay } from '@/components/shared/MoneyDisplay'
import { ChevronDown, ChevronRight, Search, Archive } from 'lucide-react'

interface Driver {
  id: string
  tag: string
  name: string
  elo: number
  balance: number
  archived: boolean
}

interface DriversTableProps {
  drivers: Driver[]
  isAdmin: boolean
}

const RANK_MEDALS: Record<number, string> = { 1: '👑', 2: '🥈', 3: '🥉' }

function ArchiveRowButton({ driver }: { driver: Driver }): React.JSX.Element {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function toggle(): Promise<void> {
    setLoading(true)
    await fetch(`/api/drivers/${driver.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: driver.archived ? 'unarchive' : 'archive' }),
    })
    router.refresh()
    setLoading(false)
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggle}
      disabled={loading}
      className="text-xs text-muted-foreground hover:text-foreground h-7"
    >
      {loading ? '…' : driver.archived ? '↩ Restaurer' : 'Archiver'}
    </Button>
  )
}

export function DriversTable({ drivers, isAdmin }: DriversTableProps): React.JSX.Element {
  const [query, setQuery] = useState('')
  const [showArchived, setShowArchived] = useState(false)

  const match = (d: Driver): boolean =>
    !query.trim() ||
    d.name.toLowerCase().includes(query.toLowerCase()) ||
    d.tag.toLowerCase().includes(query.toLowerCase())

  // Assign rank before filtering — rank = position among active drivers
  const allActive = drivers.filter((d) => !d.archived)
  const activeWithRank = allActive.map((d, i) => ({ ...d, rank: i + 1 }))
  const filtered = activeWithRank.filter((d) => match(d))

  const archived = drivers.filter((d) => d.archived && match(d))

  return (
    <div className="space-y-6">
      {/* Search */}
      <div className="relative max-w-sm">
        <Search
          size={14}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          strokeWidth={1.8}
        />
        <Input
          placeholder="Rechercher nom ou tag…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-9 font-mono text-sm"
        />
      </div>

      {/* Active leaderboard */}
      <div className="rounded-xl border border-border overflow-hidden">
        {/* Header */}
        <div className="grid grid-cols-[40px_1fr_80px_120px_100px] gap-0 border-b border-border bg-muted/30 px-4 py-2.5">
          <span className="text-[10px] font-mono tracking-widest uppercase text-muted-foreground">#</span>
          <span className="text-[10px] font-mono tracking-widest uppercase text-muted-foreground">Driver</span>
          <span className="text-[10px] font-mono tracking-widest uppercase text-muted-foreground">Tag</span>
          <span className="text-[10px] font-mono tracking-widest uppercase text-muted-foreground">ELO</span>
          <span className="text-[10px] font-mono tracking-widest uppercase text-muted-foreground">Balance</span>
        </div>

        {filtered.length === 0 ? (
          <div className="px-4 py-12 text-center text-muted-foreground text-sm font-mono tracking-widest uppercase">
            {query ? 'Aucun résultat' : 'No drivers yet'}
          </div>
        ) : (
          filtered.map((driver) => {
            const medal = RANK_MEDALS[driver.rank]
            const isTop3 = driver.rank <= 3
            const rowBg = isTop3
              ? driver.rank === 1
                ? 'bg-amber-500/5 border-l-2 border-amber-500/50'
                : driver.rank === 2
                  ? 'bg-zinc-400/5 border-l-2 border-zinc-500/30'
                  : 'bg-amber-700/5 border-l-2 border-amber-700/30'
              : ''

            return (
              <div
                key={driver.id}
                className={`grid grid-cols-[40px_1fr_80px_120px_100px] gap-0 items-center px-4 py-3 border-b border-border/50 last:border-0 hover:bg-white/[0.02] transition-colors ${rowBg}`}
              >
                {/* Rank */}
                <div className="font-mono text-sm">
                  {medal
                    ? <span className="text-base leading-none">{medal}</span>
                    : <span className="text-muted-foreground/50 text-xs">{driver.rank}</span>
                  }
                </div>

                {/* Name */}
                <div>
                  <Link
                    href={`/drivers/${driver.id}`}
                    className={`font-semibold hover:text-primary transition-colors ${isTop3 ? 'text-base' : 'text-sm'}`}
                  >
                    {driver.name}
                  </Link>
                </div>

                {/* Tag */}
                <div>
                  <span className="font-mono text-[11px] text-muted-foreground bg-muted/50 px-2 py-0.5 rounded tracking-widest">
                    {driver.tag}
                  </span>
                </div>

                {/* ELO */}
                <div>
                  <EloBadge elo={driver.elo} />
                </div>

                {/* Balance + admin action */}
                <div className="flex items-center justify-between">
                  <MoneyDisplay amount={driver.balance} className="text-sm font-mono text-green-400" />
                  {isAdmin && <ArchiveRowButton driver={driver} />}
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Archived section */}
      {archived.length > 0 && (
        <div>
          <button
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-3"
            onClick={() => setShowArchived((v) => !v)}
          >
            {showArchived
              ? <ChevronDown size={14} strokeWidth={1.8} />
              : <ChevronRight size={14} strokeWidth={1.8} />
            }
            <Archive size={13} className="opacity-60" strokeWidth={1.8} />
            <span className="font-mono text-xs tracking-widest uppercase">
              {archived.length} pilote{archived.length > 1 ? 's' : ''} archivé{archived.length > 1 ? 's' : ''}
            </span>
          </button>

          {showArchived && (
            <div className="rounded-xl border border-border/50 overflow-hidden opacity-50">
              {archived.map((driver) => (
                <div
                  key={driver.id}
                  className="grid grid-cols-[40px_1fr_80px_120px_100px] gap-0 items-center px-4 py-3 border-b border-border/30 last:border-0"
                >
                  <div className="text-muted-foreground/40 text-xs font-mono">—</div>
                  <Link href={`/drivers/${driver.id}`} className="text-sm font-medium hover:text-primary transition-colors">
                    {driver.name}
                  </Link>
                  <span className="font-mono text-[11px] text-muted-foreground bg-muted/50 px-2 py-0.5 rounded tracking-widest">
                    {driver.tag}
                  </span>
                  <EloBadge elo={driver.elo} />
                  <div className="flex items-center justify-between">
                    <MoneyDisplay amount={driver.balance} className="text-sm font-mono" />
                    {isAdmin && <ArchiveRowButton driver={driver} />}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
