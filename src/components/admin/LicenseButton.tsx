'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface LicenseButtonProps {
  driverId: string
  hasLicense: boolean
}

export function LicenseButton({ driverId, hasLicense }: LicenseButtonProps): React.JSX.Element {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (hasLicense) {
    return <Badge variant="default">Licensed</Badge>
  }

  async function handleClick(): Promise<void> {
    setLoading(true)
    setError(null)
    const res = await fetch(`/api/admin/drivers/${driverId}/license`, { method: 'POST' })
    if (!res.ok) {
      let msg = 'Failed'
      try {
        const data = await res.json() as { error?: string }
        if (typeof data.error === 'string') msg = data.error
      } catch { /* non-JSON */ }
      setError(msg)
      setLoading(false)
    } else {
      router.refresh()
    }
  }

  return (
    <div className="flex items-center gap-2">
      <Button size="sm" variant="outline" onClick={handleClick} disabled={loading}>
        {loading ? '…' : 'Buy License'}
      </Button>
      {error && <span className="text-xs text-destructive">{error}</span>}
    </div>
  )
}
