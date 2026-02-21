'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { getSupabase } from '@/lib/supabaseClient'

interface CircuitData {
  id: string
  name: string
  checkpoints: string[]
  photos: string[]
}

export function EditCircuitForm({ circuit }: { circuit: CircuitData }): React.JSX.Element {
  const router = useRouter()

  const [name, setName] = useState(circuit.name)
  const [checkpoints, setCheckpoints] = useState<string[]>(circuit.checkpoints)
  const [existingPhotos, setExistingPhotos] = useState<string[]>(circuit.photos)
  const [newFiles, setNewFiles] = useState<File[]>([])
  const [newPreviews, setNewPreviews] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

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

  function removeExistingPhoto(idx: number): void {
    setExistingPhotos((prev) => prev.filter((_, i) => i !== idx))
  }

  function handleNewFiles(e: React.ChangeEvent<HTMLInputElement>): void {
    const files = Array.from(e.target.files ?? [])
    setNewFiles(files)
    setNewPreviews(files.map((f) => URL.createObjectURL(f)))
  }

  async function uploadNewPhotos(): Promise<string[]> {
    const sb = getSupabase()
    const urls: string[] = []
    for (const file of newFiles) {
      const path = `public/${Date.now()}-${file.name.replace(/\s+/g, '_')}`
      const { error: uploadError } = await sb.storage.from('circuits').upload(path, file, { upsert: false })
      if (uploadError) throw new Error(uploadError.message)
      const { data } = sb.storage.from('circuits').getPublicUrl(path)
      urls.push(data.publicUrl)
    }
    return urls
  }

  async function handleSubmit(e: React.FormEvent): Promise<void> {
    e.preventDefault()
    if (!name.trim()) { setError('Le nom est requis'); return }
    setLoading(true)
    setError(null)

    try {
      const uploaded = await uploadNewPhotos()
      const res = await fetch(`/api/circuits/${circuit.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          checkpoints: checkpoints.filter((c) => c.trim()),
          photos: [...existingPhotos, ...uploaded],
        }),
      })

      if (!res.ok) {
        const data = (await res.json()) as { error?: string }
        setError(typeof data.error === 'string' ? data.error : 'Erreur')
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
      <CardHeader><CardTitle>Modifier le circuit</CardTitle></CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && <p className="text-sm text-destructive">{error}</p>}

          <div className="space-y-2">
            <Label htmlFor="name">Nom</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>

          <Separator />

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Checkpoints ({checkpoints.length}/6)</Label>
              {checkpoints.length < 6 && (
                <Button type="button" variant="outline" size="sm" onClick={addCheckpoint}>+ Ajouter</Button>
              )}
            </div>
            {checkpoints.length === 0 && (
              <p className="text-xs text-muted-foreground">Aucun checkpoint</p>
            )}
            <div className="space-y-2">
              {checkpoints.map((cp, idx) => (
                <div key={idx} className="flex gap-2 items-center">
                  <span className="text-xs font-mono text-muted-foreground w-6">C{idx + 1}</span>
                  <Input
                    value={cp} onChange={(e) => updateCheckpoint(idx, e.target.value)}
                    placeholder={`Checkpoint ${idx + 1}`} className="flex-1"
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

          <div className="space-y-2">
            <Label>Photos existantes</Label>
            {existingPhotos.length === 0 && (
              <p className="text-xs text-muted-foreground">Aucune photo</p>
            )}
            <div className="flex flex-wrap gap-2">
              {existingPhotos.map((src, i) => (
                <div key={i} className="relative w-24 h-24 rounded-md overflow-hidden border border-border group">
                  <Image src={src} alt={`Photo ${i + 1}`} fill className="object-cover" />
                  <button
                    type="button"
                    onClick={() => removeExistingPhoto(i)}
                    className="absolute inset-0 bg-black/50 text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                  >Retirer</button>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="newPhotos">Ajouter des photos</Label>
            <Input id="newPhotos" type="file" accept="image/*" multiple onChange={handleNewFiles} />
            {newPreviews.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {newPreviews.map((src, i) => (
                  <div key={i} className="relative w-20 h-20 rounded-md overflow-hidden border border-border">
                    <Image src={src} alt={`Nouveau ${i + 1}`} fill className="object-cover" />
                  </div>
                ))}
              </div>
            )}
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Enregistrement…' : 'Sauvegarder'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
