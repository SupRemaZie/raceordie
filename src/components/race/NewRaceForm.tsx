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

  // Circuit
  const [circuitId, setCircuitId] = useState<string>('')

  // Participants
  const [entries, setEntries] = useState<DriverEntry[]>([])
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [defaultStake, setDefaultStake] = useState('5000')

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const available = drivers.filter((d) => !entries.some((e) => e.driverId === d.id))

  // ── Circuit selection ─────────────────────────────────────────────────────
  function handleCircuitChange(value: string): void {
    setCircuitId(value)
    if (value === 'none') return
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

  // ── Multi-select drivers ──────────────────────────────────────────────────
  function toggleDriver(id: string): void {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function toggleAll(): void {
    if (selectedIds.size === available.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(available.map((d) => d.id)))
    }
  }

  function addSelected(): void {
    const toAdd = available.filter((d) => selectedIds.has(d.id))
    if (toAdd.length === 0) return
    setEntries((prev) => [
      ...prev,
      ...toAdd.map((d) => ({ driverId: d.id, name: d.name, stake: defaultStake })),
    ])
    setSelectedIds(new Set())
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
            <div className="space-y-2">
              <Label htmlFor="raceDate">Date</Label>
              <Input
                id="raceDate" type="date" value={raceDate}
                onChange={(e) => setRaceDate(e.target.value)}
              />
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

          {/* ── Sélection multi-pilotes ── */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Pilotes disponibles</Label>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-muted-foreground">Mise</span>
                  <Input
                    type="number"
                    min="1"
                    value={defaultStake}
                    onChange={(e) => setDefaultStake(e.target.value)}
                    className="w-28 h-7 text-sm"
                    placeholder="Mise ($)"
                  />
                </div>
                <Button
                  type="button"
                  size="sm"
                  disabled={selectedIds.size === 0}
                  onClick={addSelected}
                >
                  Ajouter {selectedIds.size > 0 ? `(${selectedIds.size})` : ''}
                </Button>
              </div>
            </div>

            {available.length === 0 ? (
              <p className="text-xs text-muted-foreground">Tous les pilotes ont été ajoutés</p>
            ) : (
              <div className="border border-border rounded-md overflow-hidden">
                {/* Header tout sélectionner */}
                <button
                  type="button"
                  onClick={toggleAll}
                  className="w-full flex items-center gap-3 px-3 py-2 bg-muted/30 hover:bg-muted/60 transition-colors border-b border-border text-left"
                >
                  <div className={`size-4 rounded border flex items-center justify-center shrink-0 transition-colors ${
                    selectedIds.size === available.length
                      ? 'bg-primary border-primary'
                      : selectedIds.size > 0
                        ? 'bg-primary/30 border-primary/60'
                        : 'border-border'
                  }`}>
                    {selectedIds.size === available.length && (
                      <svg className="size-2.5 text-primary-foreground" fill="none" viewBox="0 0 10 10">
                        <path d="M1.5 5l2.5 2.5 4.5-4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                    {selectedIds.size > 0 && selectedIds.size < available.length && (
                      <div className="w-2 h-0.5 bg-primary rounded" />
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {selectedIds.size === available.length ? 'Tout désélectionner' : 'Tout sélectionner'}
                  </span>
                </button>

                {/* Liste des pilotes */}
                <div className="max-h-48 overflow-y-auto divide-y divide-border">
                  {available.map((d) => (
                    <button
                      key={d.id}
                      type="button"
                      onClick={() => toggleDriver(d.id)}
                      className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-muted/40 transition-colors text-left"
                    >
                      <div className={`size-4 rounded border flex items-center justify-center shrink-0 transition-colors ${
                        selectedIds.has(d.id)
                          ? 'bg-primary border-primary'
                          : 'border-border'
                      }`}>
                        {selectedIds.has(d.id) && (
                          <svg className="size-2.5 text-primary-foreground" fill="none" viewBox="0 0 10 10">
                            <path d="M1.5 5l2.5 2.5 4.5-4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        )}
                      </div>
                      <span className="text-sm">{d.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ── Participants ajoutés ── */}
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
