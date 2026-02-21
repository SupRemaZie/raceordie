'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { supabase } from '@/lib/supabaseClient'

export function NewCircuitForm(): React.JSX.Element {
  const router = useRouter()

  const [name, setName] = useState('')
  const [checkpoints, setCheckpoints] = useState<string[]>([])
  const [photoFiles, setPhotoFiles] = useState<File[]>([])
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // ── Checkpoints ──────────────────────────────────────────────────────────
  function addCheckpoint(): void {
    if (checkpoints.length >= 6) return
    setCheckpoints((prev) => [...prev, ''])
  }

  function updateCheckpoint(idx: number, value: string): void {
    setCheckpoints((prev) => prev.map((c, i) => (i === idx ? value : c)))
  }

  function removeCheckpoint(idx: number): void {
    setCheckpoints((prev) => prev.filter((_, i) => i !== idx))
  }

  // ── Photos ───────────────────────────────────────────────────────────────
  function handlePhotoSelect(e: React.ChangeEvent<HTMLInputElement>): void {
    const files = Array.from(e.target.files ?? [])
    setPhotoFiles(files)
    setPhotoPreviews(files.map((f) => URL.createObjectURL(f)))
  }

  async function uploadPhotos(): Promise<string[]> {
    const urls: string[] = []
    for (const file of photoFiles) {
      const path = `${Date.now()}-${file.name.replace(/\s+/g, '_')}`
      const { error: uploadError } = await supabase.storage
        .from('circuits')
        .upload(path, file, { upsert: false })
      if (uploadError) throw new Error(uploadError.message)
      const { data } = supabase.storage.from('circuits').getPublicUrl(path)
      urls.push(data.publicUrl)
    }
    return urls
  }

  // ── Submit ────────────────────────────────────────────────────────────────
  async function handleSubmit(e: React.FormEvent): Promise<void> {
    e.preventDefault()
    if (!name.trim()) { setError('Le nom du circuit est requis'); return }
    setLoading(true)
    setError(null)

    try {
      const photos = await uploadPhotos()

      const res = await fetch('/api/circuits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          checkpoints: checkpoints.filter((c) => c.trim()),
          photos,
        }),
      })

      if (!res.ok) {
        const data = (await res.json()) as { error?: string }
        setError(typeof data.error === 'string' ? data.error : 'Erreur lors de la création')
        setLoading(false)
        return
      }

      router.push('/circuits')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inattendue')
      setLoading(false)
    }
  }

  return (
    <Card className="max-w-2xl">
      <CardHeader><CardTitle>Nouveau circuit</CardTitle></CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && <p className="text-sm text-destructive">{error}</p>}

          {/* ── Nom ── */}
          <div className="space-y-2">
            <Label htmlFor="name">Nom du circuit</Label>
            <Input
              id="name" value={name} onChange={(e) => setName(e.target.value)}
              placeholder="ex. Circuit de la Nuit" required
            />
          </div>

          <Separator />

          {/* ── Checkpoints ── */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Checkpoints ({checkpoints.length}/6)</Label>
              {checkpoints.length < 6 && (
                <Button type="button" variant="outline" size="sm" onClick={addCheckpoint}>
                  + Ajouter
                </Button>
              )}
            </div>
            {checkpoints.length === 0 && (
              <p className="text-xs text-muted-foreground">Aucun checkpoint — optionnel</p>
            )}
            <div className="space-y-2">
              {checkpoints.map((cp, idx) => (
                <div key={idx} className="flex gap-2 items-center">
                  <span className="text-xs font-mono text-muted-foreground w-6">C{idx + 1}</span>
                  <Input
                    value={cp}
                    onChange={(e) => updateCheckpoint(idx, e.target.value)}
                    placeholder={`Checkpoint ${idx + 1}`}
                    className="flex-1"
                  />
                  <Button
                    type="button" variant="ghost" size="sm"
                    className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                    onClick={() => removeCheckpoint(idx)}
                  >✕</Button>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* ── Photos ── */}
          <div className="space-y-2">
            <Label htmlFor="photos">Photos (optionnel)</Label>
            <Input
              id="photos" type="file" accept="image/*" multiple
              onChange={handlePhotoSelect}
            />
            {photoPreviews.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {photoPreviews.map((src, i) => (
                  <div key={i} className="relative w-20 h-20 rounded-md overflow-hidden border border-border">
                    <Image src={src} alt={`Photo ${i + 1}`} fill className="object-cover" />
                  </div>
                ))}
              </div>
            )}
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Enregistrement…' : 'Créer le circuit'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
