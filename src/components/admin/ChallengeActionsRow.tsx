'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { ResolveDialog } from './ResolveDialog'

type ChallengeStatus = 'PENDING' | 'ACTIVE' | 'RESOLVED' | 'CANCELLED'

interface ChallengeActionsRowProps {
  challengeId: string
  status: ChallengeStatus
  player1Id: string
  player2Id: string
  player1Name: string
  player2Name: string
}

export function ChallengeActionsRow({
  challengeId, status, player1Id, player2Id, player1Name, player2Name,
}: ChallengeActionsRowProps): React.JSX.Element {
  const router = useRouter()
  const [loading, setLoading] = useState<string | null>(null)
  const [resolveOpen, setResolveOpen] = useState(false)

  async function patchChallenge(action: 'activate' | 'cancel'): Promise<void> {
    setLoading(action)
    await fetch(`/api/challenges/${challengeId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action }),
    })
    setLoading(null)
    router.refresh()
  }

  if (status === 'RESOLVED' || status === 'CANCELLED') {
    return <span className="text-xs text-muted-foreground">—</span>
  }

  return (
    <div className="flex items-center gap-2">
      {status === 'PENDING' && (
        <Button
          size="sm"
          variant="outline"
          onClick={() => patchChallenge('activate')}
          disabled={loading !== null}
        >
          {loading === 'activate' ? '…' : 'Activate'}
        </Button>
      )}
      {status === 'ACTIVE' && (
        <Button
          size="sm"
          onClick={() => setResolveOpen(true)}
          disabled={loading !== null}
        >
          Resolve
        </Button>
      )}
      <Button
        size="sm"
        variant="destructive"
        onClick={() => patchChallenge('cancel')}
        disabled={loading !== null}
      >
        {loading === 'cancel' ? '…' : 'Cancel'}
      </Button>

      <ResolveDialog
        challengeId={challengeId}
        player1Id={player1Id}
        player2Id={player2Id}
        player1Name={player1Name}
        player2Name={player2Name}
        open={resolveOpen}
        onClose={() => setResolveOpen(false)}
      />
    </div>
  )
}
