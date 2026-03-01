'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'

interface Driver { id: string; name: string }
interface CircuitOption { id: string; name: string; checkpoints: string[] }
interface NewRaceFormProps { drivers: Driver[]; circuits: CircuitOption[] }
interface DriverEntry { driverId: string; name: string; stake: string }

function todayISO(): string {
  return new Date().toISOString().slice(0, 10)
}

export function NewRaceForm({ drivers, circuits }: NewRaceFormProps): React.JSX.Element {
  const router = useRouter()

  // Race info
  const [name, setName] = useState('')
  const [raceDate, setRaceDate] = useState(todayISO())
  const [checkpoints, setCheckpoints] = useState<string[]>([])
  const [commissionRate, setCommissionRate] = useState<'0.25' | '0.30'>('0.25')

  // Circuit
  const [circuitId, setCircuitId] = useState<string>('')

  // Participants
  const [entries, setEntries] = useState<DriverEntry[]>([])
  const [selectedId, setSelectedId] = useState('')
  const [stake, setStake] = useState('5000')

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const available = drivers.filter((d) => !entries.some((e) => e.driverId === d.id))

  // ── Circuit selection ─────────────────────────────────────────────────────
  function handleCircuitChange(value: string): void {
    setCircuitId(value)
    if (value === 'none') {
      // keep existing checkpoints unchanged
      return
    }
    const circuit = circuits.find((c) => c.id === value)
    if (circuit) setCheckpoints([...circuit.checkpoints])
  }

  // ── Checkpoints ──────────────────────────────────────────────────────────
  function addCheckpoint(): void {
    if (checkpoints.length >= 6) return
    setCheckpoints((prev) => [...prev, ''])
  }

  function updateCheckpoint(idx: number, value: string): void {
    setCheckpoints((prev) => prev.map((c, i) => (i === idx ? value : c)))
  }

  function removeCheckpoint(idx: number): void {
    setCheckpoints((prev) => prev.filter((_, i) => i !== idx))
  }

  // ── Participants ──────────────────────────────────────────────────────────
  function addDriver(): void {
    const driver = drivers.find((d) => d.id === selectedId)
    if (!driver) return
    setEntries((prev) => [...prev, { driverId: driver.id, name: driver.name, stake }])
    setSelectedId('')
  }

  function removeEntry(idx: number): void {
    setEntries((prev) => prev.filter((_, i) => i !== idx))
  }

  function updateStake(idx: number, value: string): void {
    setEntries((prev) => prev.map((e, i) => (i === idx ? { ...e, stake: value } : e)))
  }

  // ── Submit ────────────────────────────────────────────────────────────────
  async function handleSubmit(e: React.FormEvent): Promise<void> {
    e.preventDefault()
    if (!name.trim()) { setError('Le nom de la course est requis'); return }
    if (entries.length < 2) { setError('Minimum 2 pilotes requis'); return }
    setLoading(true)
    setError(null)

    const body: Record<string, unknown> = {
      name: name.trim(),
      raceDate,
      checkpoints: checkpoints.filter((c) => c.trim()),
      participants: entries.map((e) => ({ driverId: e.driverId, stake: parseInt(e.stake, 10) })),
      commissionRate: parseFloat(commissionRate),
    }
    if (circuitId && circuitId !== 'none') body.circuitId = circuitId

    const res = await fetch('/api/races', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })

    if (!res.ok) {
      const data = (await res.json()) as { error?: string }
      setError(typeof data.error === 'string' ? data.error : 'Erreur lors de la création')
      setLoading(false)
    } else {
      router.push('/races')
      router.refresh()
    }
  }

  return (
    <Card className="max-w-2xl">
      <CardHeader><CardTitle>Nouvelle course</CardTitle></CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && <p className="text-sm text-destructive">{error}</p>}

          {/* ── Infos générales ── */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nom de la course</Label>
              <Input
                id="name" value={name} onChange={(e) => setName(e.target.value)}
                placeholder="ex. Midnight Sprint" required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="raceDate">Date</Label>
                <Input
                  id="raceDate" type="date" value={raceDate}
                  onChange={(e) => setRaceDate(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Commission</Label>
                <Select value={commissionRate} onValueChange={(v) => setCommissionRate(v as '0.25' | '0.30')}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0.25">25%</SelectItem>
                    <SelectItem value="0.30">30%</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <Separator />

          {/* ── Circuit (optionnel) ── */}
          {circuits.length > 0 && (
            <div className="space-y-2">
              <Label>Circuit (optionnel)</Label>
              <Select value={circuitId} onValueChange={handleCircuitChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Aucun circuit sélectionné" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Aucun circuit</SelectItem>
                  {circuits.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {circuitId && circuitId !== 'none' && (
                <p className="text-xs text-muted-foreground">
                  Les checkpoints ont été pré-remplis depuis le circuit — modifiables ci-dessous
                </p>
              )}
            </div>
          )}

          {/* ── Checkpoints ── */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Checkpoints ({checkpoints.length}/6)</Label>
              {checkpoints.length < 6 && (
                <Button type="button" variant="outline" size="sm" onClick={addCheckpoint}>
                  + Ajouter
                </Button>
              )}
            </div>
            {checkpoints.length === 0 && (
              <p className="text-xs text-muted-foreground">Aucun checkpoint — optionnel</p>
            )}
            <div className="space-y-2">
              {checkpoints.map((cp, idx) => (
                <div key={idx} className="flex gap-2 items-center">
                  <span className="text-xs font-mono text-muted-foreground w-6">C{idx + 1}</span>
                  <Input
                    value={cp}
                    onChange={(e) => updateCheckpoint(idx, e.target.value)}
                    placeholder={`Checkpoint ${idx + 1}`}
                    className="flex-1"
                  />
                  <Button
                    type="button" variant="ghost" size="sm"
                    className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                    onClick={() => removeCheckpoint(idx)}
                  >✕</Button>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* ── Participants ── */}
          <div className="space-y-2">
            <Label>Ajouter un pilote</Label>
            <div className="flex gap-2">
              <Select value={selectedId} onValueChange={setSelectedId}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Choisir un pilote…" />
                </SelectTrigger>
                <SelectContent>
                  {available.map((d) => (
                    <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                type="number" min="1" value={stake}
                onChange={(e) => setStake(e.target.value)}
                className="w-28" placeholder="Mise ($)"
              />
              <Button type="button" onClick={addDriver} disabled={!selectedId}>Ajouter</Button>
            </div>
          </div>

          {entries.length > 0 && (
            <div className="space-y-2">
              <Label>Participants ({entries.length})</Label>
              <div className="space-y-1.5">
                {entries.map((entry, idx) => (
                  <div key={entry.driverId} className="flex items-center gap-3 px-3 py-2 rounded-md bg-muted/40">
                    <span className="flex-1 font-medium text-sm">{entry.name}</span>
                    <Input
                      type="number" min="1" value={entry.stake}
                      onChange={(e) => updateStake(idx, e.target.value)}
                      className="w-28 h-8 text-sm"
                    />
                    <Button
                      type="button" variant="ghost" size="sm"
                      className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                      onClick={() => removeEntry(idx)}
                    >✕</Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <Button type="submit" className="w-full" disabled={loading || entries.length < 2}>
            {loading ? 'Enregistrement…' : `Créer la course${entries.length >= 2 ? ` (${entries.length} pilotes)` : ''}`}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
