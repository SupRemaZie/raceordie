'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface SetDriverCodeFormProps {
  driverId: string
  currentCode?: string | null
}

export function SetDriverCodeForm({ driverId, currentCode }: SetDriverCodeFormProps): React.JSX.Element {
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  async function handleSubmit(e: React.FormEvent): Promise<void> {
    e.preventDefault()
    if (code.trim().length < 4) { setError('Le code doit faire au moins 4 caractères'); return }
    setLoading(true)
    setError(null)
    setSuccess(false)

    const res = await fetch(`/api/drivers/${driverId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ loginCode: code.trim() }),
    })

    if (!res.ok) {
      const json = (await res.json()) as { error?: string }
      setError(typeof json.error === 'string' ? json.error : 'Erreur')
    } else {
      setSuccess(true)
      setCode('')
    }
    setLoading(false)
  }

  return (
    <Card className="max-w-sm">
      <CardHeader>
        <CardTitle className="text-sm font-mono tracking-widest uppercase">Code d&apos;accès driver</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground font-mono">
              Code actuel :{' '}
              <span className="text-foreground">
                {currentCode ? '••••' : 'Non défini'}
              </span>
            </Label>
          </div>

          <div className="space-y-2">
            <Label htmlFor={`loginCode-${driverId}`}>Nouveau code (4–20 caractères)</Label>
            <Input
              id={`loginCode-${driverId}`}
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="ex. ghost2025"
              minLength={4}
              maxLength={20}
              disabled={loading}
            />
          </div>

          {error && <p className="text-xs text-destructive">{error}</p>}
          {success && <p className="text-xs text-green-400">Code mis à jour ✓</p>}

          <Button type="submit" className="w-full" disabled={loading || code.trim().length < 4}>
            {loading ? 'Enregistrement…' : 'Définir le code'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
