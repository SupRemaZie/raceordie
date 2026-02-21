'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export function NewDriverForm(): React.JSX.Element {
  const router = useRouter()
  const [tag, setTag] = useState('')
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent): Promise<void> {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const res = await fetch('/api/drivers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tag: tag.toUpperCase(), name }),
    })

    if (!res.ok) {
      const data = (await res.json()) as { error?: string }
      setError(typeof data.error === 'string' ? data.error : 'Erreur lors de la création')
      setLoading(false)
    } else {
      router.push('/drivers')
      router.refresh()
    }
  }

  return (
    <Card className="max-w-sm">
      <CardHeader><CardTitle>Nouveau racer</CardTitle></CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <p className="text-sm text-destructive">{error}</p>}

          <div className="space-y-2">
            <Label htmlFor="tag">Tag (2–4 caractères)</Label>
            <Input
              id="tag"
              value={tag}
              onChange={(e) => setTag(e.target.value.toUpperCase())}
              placeholder="ex. VLTG"
              maxLength={4}
              required
            />
            <p className="text-xs text-muted-foreground">Lettres et chiffres uniquement, unique</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Nom</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="ex. Voltage"
              required
            />
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Création…' : 'Créer le racer'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
