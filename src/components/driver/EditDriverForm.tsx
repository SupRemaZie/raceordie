'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface EditDriverFormProps {
  driver: { id: string; name: string }
}

export function EditDriverForm({ driver }: EditDriverFormProps): React.JSX.Element {
  const router = useRouter()
  const [name, setName] = useState(driver.name)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)

  async function handleSubmit(e: React.FormEvent): Promise<void> {
    e.preventDefault()
    if (!name.trim()) { setError('Le nom est requis'); return }
    setLoading(true)
    setError(null)
    setSaved(false)

    const res = await fetch(`/api/drivers/${driver.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: name.trim() }),
    })

    if (!res.ok) {
      const data = (await res.json()) as { error?: string }
      setError(typeof data.error === 'string' ? data.error : 'Erreur')
    } else {
      setSaved(true)
      router.refresh()
    }
    setLoading(false)
  }

  return (
    <Card className="max-w-sm">
      <CardHeader><CardTitle className="text-base">Modifier le pilote</CardTitle></CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <p className="text-sm text-destructive">{error}</p>}
          {saved && <p className="text-sm text-green-500">Sauvegardé ✓</p>}
          <div className="space-y-2">
            <Label htmlFor="driverName">Nom</Label>
            <Input
              id="driverName" value={name}
              onChange={(e) => setName(e.target.value)} required
            />
          </div>
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? 'Enregistrement…' : 'Sauvegarder'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
