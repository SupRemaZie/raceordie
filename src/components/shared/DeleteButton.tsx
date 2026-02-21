'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'

interface DeleteButtonProps {
  url: string
  redirectTo: string
  label?: string
  confirmMessage?: string
}

export function DeleteButton({
  url,
  redirectTo,
  label = 'Supprimer',
  confirmMessage = 'Confirmer la suppression ?',
}: DeleteButtonProps): React.JSX.Element {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleDelete(): Promise<void> {
    if (!window.confirm(confirmMessage)) return
    setLoading(true)
    setError(null)
    const res = await fetch(url, { method: 'DELETE' })
    if (res.ok) {
      router.push(redirectTo)
      router.refresh()
    } else {
      const data = (await res.json().catch(() => ({}))) as { error?: string }
      setError(typeof data.error === 'string' ? data.error : 'Erreur lors de la suppression')
      setLoading(false)
    }
  }

  return (
    <div>
      <Button variant="destructive" onClick={handleDelete} disabled={loading}>
        {loading ? 'Suppression…' : label}
      </Button>
      {error && <p className="text-xs text-destructive mt-1">{error}</p>}
    </div>
  )
}
