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
  name: string
}

interface NewChallengeFormProps {
  drivers: Driver[]
}

export function NewChallengeForm({ drivers }: NewChallengeFormProps): React.JSX.Element {
  const router = useRouter()
  const [player1Id, setPlayer1Id] = useState('')
  const [player2Id, setPlayer2Id] = useState('')
  const [stake, setStake] = useState('1000')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent): Promise<void> {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const res = await fetch('/api/challenges', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ player1Id, player2Id, stake: parseInt(stake, 10) }),
    })

    if (!res.ok) {
      const data = await res.json() as { error?: string }
      setError(typeof data.error === 'string' ? data.error : 'Failed to create challenge')
      setLoading(false)
    } else {
      router.push('/challenges')
      router.refresh()
    }
  }

  return (
    <Card className="max-w-lg">
      <CardHeader>
        <CardTitle>New 1v1 Challenge</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <p className="text-sm text-destructive">{error}</p>}

          <div className="space-y-2">
            <Label>Player 1</Label>
            <Select value={player1Id} onValueChange={setPlayer1Id} required>
              <SelectTrigger>
                <SelectValue placeholder="Select driver" />
              </SelectTrigger>
              <SelectContent>
                {drivers.map((d) => (
                  <SelectItem key={d.id} value={d.id}>
                    {d.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Player 2</Label>
            <Select value={player2Id} onValueChange={setPlayer2Id} required>
              <SelectTrigger>
                <SelectValue placeholder="Select driver" />
              </SelectTrigger>
              <SelectContent>
                {drivers.map((d) => (
                  <SelectItem key={d.id} value={d.id}>
                    {d.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Stake per driver ($)</Label>
            <Input
              type="number"
              min="1"
              value={stake}
              onChange={(e) => setStake(e.target.value)}
              required
            />
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Creating…' : 'Create Challenge'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
