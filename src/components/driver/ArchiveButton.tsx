'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'

interface ArchiveButtonProps {
  driverId: string
  archived: boolean
}

export function ArchiveButton({ driverId, archived }: ArchiveButtonProps): React.JSX.Element {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleToggle(): Promise<void> {
    setLoading(true)
    await fetch(`/api/drivers/${driverId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: archived ? 'unarchive' : 'archive' }),
    })
    router.refresh()
    setLoading(false)
  }

  return (
    <Button variant="outline" onClick={handleToggle} disabled={loading}>
      {loading ? '…' : archived ? '↩ Désarchiver' : '📦 Archiver'}
    </Button>
  )
}
