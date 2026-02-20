'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface Driver {
  id: string
  tag: string
  name: string
}

interface NewRaceFormProps {
  drivers: Driver[]
}

interface DriverEntry {
  driverId: string
  stake: string
}

export function NewRaceForm({ drivers }: NewRaceFormProps): React.JSX.Element {
  const router = useRouter()
  const [entries, setEntries] = useState<DriverEntry[]>([
    { driverId: '', stake: '500' },
    { driverId: '', stake: '500' },
    { driverId: '', stake: '500' },
  ])
  const [commissionRate, setCommissionRate] = useState<'0.25' | '0.30'>('0.25')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function updateEntry(idx: number, field: keyof DriverEntry, value: string): void {
    setEntries((prev) => prev.map((e, i) => i === idx ? { ...e, [field]: value } : e))
  }

  function addEntry(): void {
    setEntries((prev) => [...prev, { driverId: '', stake: '500' }])
  }

  function removeEntry(idx: number): void {
    if (entries.length <= 3) return
    setEntries((prev) => prev.filter((_, i) => i !== idx))
  }

  async function handleSubmit(e: React.FormEvent): Promise<void> {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const finishedOrder = entries.map((e) => e.driverId)
    const stakes = entries.map((e) => parseInt(e.stake, 10))

    const res = await fetch('/api/races', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ finishedOrder, stakes, commissionRate: parseFloat(commissionRate) }),
    })

    if (!res.ok) {
      const data = await res.json() as { error?: string }
      setError(typeof data.error === 'string' ? data.error : 'Failed to create race')
      setLoading(false)
    } else {
      router.push('/races')
      router.refresh()
    }
  }

  return (
    <Card className="max-w-2xl">
      <CardHeader>
        <CardTitle>New Race</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && <p className="text-sm text-destructive">{error}</p>}

          <div className="space-y-2">
            <Label>Commission Rate</Label>
            <Select value={commissionRate} onValueChange={(v) => setCommissionRate(v as '0.25' | '0.30')}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0.25">25%</SelectItem>
                <SelectItem value="0.30">30%</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            <Label>Finish Order (1st → last)</Label>
            {entries.map((entry, idx) => (
              <div key={idx} className="flex gap-2 items-center">
                <span className="text-sm font-mono w-6">P{idx + 1}</span>
                <Select value={entry.driverId} onValueChange={(v) => updateEntry(idx, 'driverId', v)}>
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Select driver" />
                  </SelectTrigger>
                  <SelectContent>
                    {drivers.map((d) => (
                      <SelectItem key={d.id} value={d.id}>
                        [{d.tag}] {d.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  type="number"
                  min="1"
                  value={entry.stake}
                  onChange={(e) => updateEntry(idx, 'stake', e.target.value)}
                  className="w-28"
                  placeholder="Stake"
                />
                <Button type="button" variant="outline" size="sm" onClick={() => removeEntry(idx)}>
                  ✕
                </Button>
              </div>
            ))}
            <Button type="button" variant="outline" onClick={addEntry}>
              + Add Driver
            </Button>
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Saving…' : 'Resolve Race'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
