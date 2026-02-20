'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export function CreateDriverForm(): React.JSX.Element {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>): Promise<void> {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const form = e.currentTarget
    const tag = (form.elements.namedItem('tag') as HTMLInputElement).value.toUpperCase()
    const name = (form.elements.namedItem('name') as HTMLInputElement).value

    const res = await fetch('/api/drivers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tag, name }),
    })

    if (!res.ok) {
      let msg = 'Failed to create driver'
      try {
        const data = await res.json() as { error?: string }
        if (typeof data.error === 'string') msg = data.error
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
            <Label htmlFor="tag">TAG (2–4 chars)</Label>
            <Input
              id="tag"
              name="tag"
              maxLength={4}
              minLength={2}
              required
              autoFocus
              className="uppercase font-mono"
              placeholder="KNGX"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" name="name" required placeholder="Street name" />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Creating…' : 'Create Driver'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
