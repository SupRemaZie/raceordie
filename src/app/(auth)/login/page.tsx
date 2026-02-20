'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function LoginPage(): React.JSX.Element {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>): Promise<void> {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const form = e.currentTarget
    const username = (form.elements.namedItem('username') as HTMLInputElement).value
    const password = (form.elements.namedItem('password') as HTMLInputElement).value

    const result = await signIn('credentials', { username, password, redirect: false })

    if (result?.error) {
      setError('Pseudo ou mot de passe incorrect')
      setLoading(false)
    } else {
      router.push('/ranking')
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="w-full max-w-md space-y-6 px-4">
        {/* Brand header */}
        <div className="text-center space-y-1">
          <div className="racing-stripe h-1 w-24 mx-auto rounded mb-4" />
          <h1
            className="text-4xl font-black tracking-widest text-primary uppercase"
            style={{ fontFamily: 'var(--font-orbitron)' }}
          >
            RACEORDIE
          </h1>
          <p className="text-sm text-muted-foreground font-mono">🚘 Underground Racing ELO</p>
        </div>

      <Card className="w-full border-border bg-card">
        <CardHeader>
          <CardTitle className="text-xl font-bold">Se connecter</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && <p className="text-sm text-destructive">{error}</p>}
            <div className="space-y-2">
              <Label htmlFor="username">Pseudo</Label>
              <Input id="username" name="username" type="text" required autoFocus autoComplete="username" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Mot de passe</Label>
              <Input id="password" name="password" type="password" required autoComplete="current-password" />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Connexion…' : 'Se connecter'}
            </Button>
            <p className="text-center text-sm text-muted-foreground">
              Pas de compte ?{' '}
              <a href="/register" className="underline">S&apos;inscrire</a>
            </p>
          </form>
        </CardContent>
      </Card>
      </div>
    </div>
  )
}
