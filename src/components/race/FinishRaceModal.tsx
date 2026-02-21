'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface Participant {
  driverId: string
  name: string
}

interface FinishRaceModalProps {
  raceId: string
  participants: Participant[]
  open: boolean
  onClose: () => void
}

const PODIUM = [
  { label: '🥇 1ère place', key: 0 },
  { label: '🥈 2ème place', key: 1 },
  { label: '🥉 3ème place', key: 2 },
] as const

export function FinishRaceModal({ raceId, participants, open, onClose }: FinishRaceModalProps): React.JSX.Element {
  const router = useRouter()
  const [top3, setTop3] = useState<[string, string, string]>(['', '', ''])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function setPosition(pos: 0 | 1 | 2, value: string): void {
    setTop3((prev) => {
      const next: [string, string, string] = [...prev] as [string, string, string]
      next[pos] = value
      return next
    })
  }

  function available(pos: 0 | 1 | 2): Participant[] {
    const others = top3.filter((_, i) => i !== pos)
    return participants.filter((p) => !others.includes(p.driverId))
  }

  async function handleSubmit(): Promise<void> {
    if (top3.some((id) => !id)) { setError('Sélectionne les 3 premiers'); return }
    setLoading(true)
    setError(null)

    const res = await fetch(`/api/races/${raceId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ top3 }),
    })

    if (!res.ok) {
      const data = (await res.json()) as { error?: string }
      setError(typeof data.error === 'string' ? data.error : 'Erreur')
      setLoading(false)
    } else {
      router.refresh()
      onClose()
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Résultat de la course</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {error && <p className="text-sm text-destructive">{error}</p>}
          {PODIUM.map(({ label, key }) => (
            <div key={key} className="space-y-1.5">
              <Label>{label}</Label>
              <Select value={top3[key]} onValueChange={(v) => setPosition(key, v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Choisir un pilote…" />
                </SelectTrigger>
                <SelectContent>
                  {available(key).map((p) => (
                    <SelectItem key={p.driverId} value={p.driverId}>{p.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ))}
          <p className="text-xs text-muted-foreground">
            Les autres pilotes reçoivent automatiquement +10 pts
          </p>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Annuler</Button>
          <Button onClick={handleSubmit} disabled={loading || top3.some((id) => !id)}>
            {loading ? 'Enregistrement…' : 'Valider la course'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
