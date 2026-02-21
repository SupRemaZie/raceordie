'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'

type ChallengeStatus = 'PENDING' | 'ACTIVE' | 'RESOLVED' | 'CANCELLED'

interface Player { id: string; name: string }

interface ChallengeActionsProps {
  challengeId: string
  status: ChallengeStatus
  player1: Player
  player2: Player
}

export function ChallengeActions({
  challengeId,
  status,
  player1,
  player2,
}: ChallengeActionsProps): React.JSX.Element | null {
  const router = useRouter()
  const [winnerId, setWinnerId] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (status === 'RESOLVED' || status === 'CANCELLED') return null

  async function sendAction(action: string, extra?: Record<string, unknown>): Promise<void> {
    setLoading(true)
    setError(null)
    const res = await fetch(`/api/challenges/${challengeId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, ...extra }),
    })
    if (!res.ok) {
      const data = (await res.json()) as { error?: string }
      setError(typeof data.error === 'string' ? data.error : 'Erreur')
    } else {
      router.refresh()
    }
    setLoading(false)
  }

  return (
    <div className="space-y-4">
      {error && <p className="text-sm text-destructive">{error}</p>}

      {status === 'PENDING' && (
        <Button onClick={() => sendAction('activate')} disabled={loading} className="w-full">
          ▶ Activer le challenge
        </Button>
      )}

      {status === 'ACTIVE' && (
        <div className="space-y-3">
          <div className="space-y-2">
            <Label>Désigner le vainqueur</Label>
            <Select value={winnerId} onValueChange={setWinnerId}>
              <SelectTrigger>
                <SelectValue placeholder="Choisir le vainqueur…" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={player1.id}>{player1.name}</SelectItem>
                <SelectItem value={player2.id}>{player2.name}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button
            onClick={() => sendAction('resolve', { winnerId })}
            disabled={loading || !winnerId}
            className="w-full"
          >
            🏆 Résoudre le challenge
          </Button>
        </div>
      )}

      <Button
        variant="outline"
        onClick={() => sendAction('cancel')}
        disabled={loading}
        className="w-full"
      >
        Annuler le challenge
      </Button>
    </div>
  )
}
