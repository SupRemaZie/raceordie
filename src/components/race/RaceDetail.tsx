'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { FinishRaceModal } from '@/components/race/FinishRaceModal'
import { DeleteButton } from '@/components/shared/DeleteButton'

interface Driver { id: string; name: string }

interface Result {
  id: string
  driverId: string
  position: number
  payout: number
  stake: number
  driver: Driver
}

interface Race {
  id: string
  name: string
  raceDate: Date
  checkpoints: string[]
  season: number
  organizerFee: number
  commissionRate: number
  resolvedAt: Date | null
  results: Result[]
}

interface RaceDetailProps {
  race: Race
  isAdmin?: boolean
}

const MEDAL: Record<number, string> = { 1: '🥇', 2: '🥈', 3: '🥉' }

export function RaceDetail({ race, isAdmin = false }: RaceDetailProps): React.JSX.Element {
  const [modalOpen, setModalOpen] = useState(false)
  const isPending = !race.resolvedAt

  const totalPool = race.results.reduce((s, r) => s + r.stake, 0)

  const participants = race.results.map((r) => ({
    driverId: r.driverId,
    name: r.driver.name,
    stake: r.stake,
  }))

  const finished = race.results
    .filter((r) => r.position > 0)
    .sort((a, b) => a.position - b.position)

  return (
    <div className="max-w-xl space-y-6">
      {/* Header info */}
      <div className="space-y-2">
        <div className="flex items-center gap-3 flex-wrap">
          <Badge variant={isPending ? 'secondary' : 'default'}>
            {isPending ? 'En attente' : 'Terminée'}
          </Badge>
          <span className="text-sm text-muted-foreground">
            {new Date(race.raceDate).toLocaleDateString('fr-FR', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })}
          </span>
        </div>
        <div className="flex gap-4 text-sm text-muted-foreground">
          <span>Pool total : <strong className="text-foreground">${totalPool.toLocaleString()}</strong></span>
          <span>Commission : <strong className="text-foreground">${race.organizerFee.toLocaleString()}</strong></span>
        </div>
        {race.checkpoints.length > 0 && (
          <div className="space-y-1">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Checkpoints</p>
            <div className="flex flex-wrap gap-2">
              {race.checkpoints.map((cp, i) => (
                <span key={i} className="text-xs px-2 py-0.5 rounded bg-muted font-mono">C{i + 1} {cp}</span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Pending: participants + stakes */}
      {isPending && (
        <>
          <div className="space-y-2">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Participants ({participants.length})
            </h2>
            <div className="space-y-1.5">
              {participants.map((p) => (
                <div key={p.driverId} className="flex items-center justify-between px-4 py-2.5 rounded-md bg-muted/40">
                  <span className="font-medium">{p.name}</span>
                  <span className="font-mono text-sm text-muted-foreground">
                    ${p.stake.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <Button onClick={() => setModalOpen(true)} className="w-full">
            🏁 Marquer la course comme terminée
          </Button>
          {isAdmin && (
            <DeleteButton
              url={`/api/races/${race.id}`}
              redirectTo="/races"
              confirmMessage="Supprimer cette course ? Cette action est irréversible."
            />
          )}

          <FinishRaceModal
            raceId={race.id}
            participants={participants}
            open={modalOpen}
            onClose={() => setModalOpen(false)}
          />
        </>
      )}

      {/* Finished: podium + all results */}
      {!isPending && (
        <div className="space-y-2">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            Résultats
          </h2>
          <div className="space-y-1.5">
            {finished.map((r) => (
              <div key={r.id} className="flex items-center gap-3 px-4 py-2.5 rounded-md bg-muted/40">
                <span className="w-8 text-lg">{MEDAL[r.position] ?? `P${r.position}`}</span>
                <span className="flex-1 font-medium">{r.driver.name}</span>
                <span className="font-mono text-sm text-muted-foreground">
                  mise ${r.stake.toLocaleString()}
                </span>
                {r.payout > 0 && (
                  <span className="font-mono text-sm font-semibold text-green-500">
                    +${r.payout.toLocaleString()}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
