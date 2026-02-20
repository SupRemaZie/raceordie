'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface ResolveDialogProps {
  challengeId: string
  player1Id: string
  player2Id: string
  player1Tag: string
  player2Tag: string
  open: boolean
  onClose: () => void
}

export function ResolveDialog({
  challengeId, player1Id, player2Id, player1Tag, player2Tag, open, onClose,
}: ResolveDialogProps): React.JSX.Element {
  const router = useRouter()
  const [winnerId, setWinnerId] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleConfirm(): Promise<void> {
    if (!winnerId) return
    setLoading(true)
    setError(null)

    const res = await fetch(`/api/challenges/${challengeId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'resolve', winnerId }),
    })

    if (!res.ok) {
      let msg = 'Failed to resolve'
      try {
        const data = await res.json() as { error?: string }
        if (typeof data.error === 'string') msg = data.error
      } catch { /* non-JSON */ }
      setError(msg)
      setLoading(false)
    } else {
      onClose()
      router.refresh()
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose() }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Resolve Challenge</DialogTitle>
        </DialogHeader>
        <div className="py-4 space-y-4">
          <Select value={winnerId} onValueChange={setWinnerId}>
            <SelectTrigger>
              <SelectValue placeholder="Select winner" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={player1Id}>[{player1Tag}] — Player 1</SelectItem>
              <SelectItem value={player2Id}>[{player2Tag}] — Player 2</SelectItem>
            </SelectContent>
          </Select>
          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleConfirm} disabled={!winnerId || loading}>
            {loading ? 'Resolving…' : 'Confirm'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
