'use client'

import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getSupabase } from '@/lib/supabaseClient'

interface AvatarUploadProps {
  driverId: string
  currentPhoto?: string | null
}

export function AvatarUpload({ driverId, currentPhoto }: AvatarUploadProps): React.JSX.Element {
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)

  const [preview, setPreview] = useState<string | null>(null)
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>): void {
    const selected = e.target.files?.[0]
    if (!selected) return
    setFile(selected)
    setPreview(URL.createObjectURL(selected))
    setSuccess(false)
    setError(null)
  }

  async function handleUpload(): Promise<void> {
    if (!file) return
    setLoading(true)
    setError(null)

    try {
      const sb = getSupabase()
      const ext = file.name.split('.').pop() ?? 'jpg'
      const path = `public/${driverId}-${Date.now()}.${ext}`

      const { error: uploadError } = await sb.storage
        .from('drivers')
        .upload(path, file, { upsert: true })
      if (uploadError) throw new Error(uploadError.message)

      const { data } = sb.storage.from('drivers').getPublicUrl(path)

      const res = await fetch(`/api/drivers/${driverId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ photo: data.publicUrl }),
      })

      if (!res.ok) {
        const json = (await res.json()) as { error?: string }
        throw new Error(typeof json.error === 'string' ? json.error : 'Erreur lors de la mise à jour')
      }

      setSuccess(true)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inattendue')
    } finally {
      setLoading(false)
    }
  }

  const displayPhoto = preview ?? currentPhoto ?? null

  return (
    <Card className="max-w-sm">
      <CardHeader>
        <CardTitle className="text-sm font-mono tracking-widest uppercase">Photo de profil</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Avatar preview */}
        <div className="flex justify-center">
          <div
            className="w-24 h-24 rounded-full overflow-hidden border-2 border-border bg-muted flex items-center justify-center"
            style={{ position: 'relative' }}
          >
            {displayPhoto ? (
              <Image
                src={displayPhoto}
                alt="Photo de profil"
                fill
                className="object-cover"
                unoptimized={preview !== null}
              />
            ) : (
              <span className="text-3xl font-black text-muted-foreground select-none">?</span>
            )}
          </div>
        </div>

        {/* File input (hidden) */}
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileSelect}
        />

        {/* Buttons */}
        <div className="space-y-2">
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={() => inputRef.current?.click()}
            disabled={loading}
          >
            Choisir une image
          </Button>

          {file && (
            <Button
              type="button"
              className="w-full"
              onClick={handleUpload}
              disabled={loading}
            >
              {loading ? 'Upload en cours…' : 'Enregistrer la photo'}
            </Button>
          )}
        </div>

        {error && <p className="text-xs text-destructive">{error}</p>}
        {success && <p className="text-xs text-green-400">Photo mise à jour ✓</p>}
      </CardContent>
    </Card>
  )
}
