'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import type { RankingConfigRecord } from '@/repositories/interfaces/IRankingConfigRepository'

const DEFAULTS: RankingConfigRecord = {
  eloFloor: 800,
  diffThreshold: 50,
  strongWinDelta: 25,
  strongLossDelta: 15,
  evenWinDelta: 15,
  evenLossDelta: 15,
  weakWinDelta: 8,
  weakLossDelta: 25,
  racePoints1: 100,
  racePoints2: 50,
  racePoints3: 30,
  racePointsOther: 10,
}

interface Props {
  initialValues?: RankingConfigRecord
}

function NumField({
  id,
  label,
  value,
  onChange,
}: {
  id: string
  label: string
  value: number
  onChange: (val: number) => void
}): React.JSX.Element {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id} className="text-xs text-muted-foreground">{label}</Label>
      <Input
        id={id}
        type="number"
        min={1}
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value, 10) || 1)}
        className="h-8 text-sm"
      />
    </div>
  )
}

export function RankingConfigForm({ initialValues }: Props): React.JSX.Element {
  const router = useRouter()
  const [values, setValues] = useState<RankingConfigRecord>(initialValues ?? DEFAULTS)
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle')

  function set(key: keyof RankingConfigRecord, val: number): void {
    setValues((prev) => ({ ...prev, [key]: val }))
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>): Promise<void> {
    e.preventDefault()
    setLoading(true)
    setStatus('idle')

    const res = await fetch('/api/admin/ranking-config', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(values),
    })

    setLoading(false)
    if (res.ok) {
      setStatus('success')
      router.refresh()
    } else {
      setStatus('error')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      {/* ELO Général */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold tracking-widest uppercase text-muted-foreground">
            ELO Général
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4">
          <NumField
            id="eloFloor"
            label="Plancher ELO"
            value={values.eloFloor}
            onChange={(v) => set('eloFloor', v)}
          />
        </CardContent>
      </Card>

      {/* ELO Challenges */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold tracking-widest uppercase text-muted-foreground">
            ELO Challenges
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <NumField
            id="diffThreshold"
            label="Seuil d'écart ELO"
            value={values.diffThreshold}
            onChange={(v) => set('diffThreshold', v)}
          />

          <Separator />

          <p className="text-xs text-muted-foreground font-mono">Favori battu (écart &gt; seuil)</p>
          <div className="grid grid-cols-2 gap-4">
            <NumField
              id="strongWinDelta"
              label="Gagnant +delta"
              value={values.strongWinDelta}
              onChange={(v) => set('strongWinDelta', v)}
            />
            <NumField
              id="strongLossDelta"
              label="Perdant −delta"
              value={values.strongLossDelta}
              onChange={(v) => set('strongLossDelta', v)}
            />
          </div>

          <Separator />

          <p className="text-xs text-muted-foreground font-mono">Match équilibré (écart ≤ seuil)</p>
          <div className="grid grid-cols-2 gap-4">
            <NumField
              id="evenWinDelta"
              label="Gagnant +delta"
              value={values.evenWinDelta}
              onChange={(v) => set('evenWinDelta', v)}
            />
            <NumField
              id="evenLossDelta"
              label="Perdant −delta"
              value={values.evenLossDelta}
              onChange={(v) => set('evenLossDelta', v)}
            />
          </div>

          <Separator />

          <p className="text-xs text-muted-foreground font-mono">Faible battu (écart &lt; −seuil)</p>
          <div className="grid grid-cols-2 gap-4">
            <NumField
              id="weakWinDelta"
              label="Gagnant +delta"
              value={values.weakWinDelta}
              onChange={(v) => set('weakWinDelta', v)}
            />
            <NumField
              id="weakLossDelta"
              label="Perdant −delta"
              value={values.weakLossDelta}
              onChange={(v) => set('weakLossDelta', v)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Points Course */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold tracking-widest uppercase text-muted-foreground">
            Points Course
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4">
          <NumField
            id="racePoints1"
            label="1er place"
            value={values.racePoints1}
            onChange={(v) => set('racePoints1', v)}
          />
          <NumField
            id="racePoints2"
            label="2e place"
            value={values.racePoints2}
            onChange={(v) => set('racePoints2', v)}
          />
          <NumField
            id="racePoints3"
            label="3e place"
            value={values.racePoints3}
            onChange={(v) => set('racePoints3', v)}
          />
          <NumField
            id="racePointsOther"
            label="Autres places"
            value={values.racePointsOther}
            onChange={(v) => set('racePointsOther', v)}
          />
        </CardContent>
      </Card>

      {status === 'success' && (
        <p className="text-sm text-green-500">Configuration sauvegardée.</p>
      )}
      {status === 'error' && (
        <p className="text-sm text-destructive">Erreur lors de la sauvegarde.</p>
      )}

      <Button type="submit" disabled={loading}>
        {loading ? 'Sauvegarde…' : 'Sauvegarder'}
      </Button>
    </form>
  )
}
