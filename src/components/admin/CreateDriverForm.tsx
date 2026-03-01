'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const ERROR_MESSAGES: Record<string, string> = {
  NAME_TAKEN: 'Ce nom est déjà pris.',
  LOGIN_CODE_TAKEN: 'Ce code de connexion est déjà utilisé.',
}

export function CreateDriverForm(): React.JSX.Element {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>): Promise<void> {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const form = e.currentTarget
    const name = (form.elements.namedItem('name') as HTMLInputElement).value
    const loginCode = (form.elements.namedItem('loginCode') as HTMLInputElement).value

    const res = await fetch('/api/drivers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, loginCode }),
    })

    if (!res.ok) {
      let msg = 'Erreur lors de la création du driver'
      try {
        const data = await res.json() as { error?: string }
        if (typeof data.error === 'string') {
          msg = ERROR_MESSAGES[data.error] ?? data.error
        }
      } catch { /* non-JSON */ }
      setError(msg)
      setLoading(false)
    } else {
      router.push('/admin/drivers')
      router.refresh()
    }
  }

  return (
    <Card className="max-w-md">
      <CardHeader>
        <CardTitle>New Driver</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <p className="text-sm text-destructive">{error}</p>}
          <div className="space-y-2">
            <Label htmlFor="name">Nom</Label>
            <Input id="name" name="name" required autoFocus placeholder="Street name" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="loginCode">Code de connexion</Label>
            <Input
              id="loginCode"
              name="loginCode"
              required
              minLength={4}
              maxLength={20}
              placeholder="Min. 4 caractères"
            />
            <p className="text-xs text-muted-foreground">Le driver utilisera ce code pour se connecter.</p>
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Création…' : 'Créer le driver'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
