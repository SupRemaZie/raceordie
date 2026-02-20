'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import type { SeasonRewardResult } from '@/domain/season/types'

interface CloseSeasonButtonProps {
  rewardsPreview: SeasonRewardResult[]
}

export function CloseSeasonButton({ rewardsPreview }: CloseSeasonButtonProps): React.JSX.Element {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  async function handleClose(): Promise<void> {
    setLoading(true)
    await fetch('/api/season', { method: 'POST' })
    setLoading(false)
    setDone(true)
    router.refresh()
  }

  return (
    <>
      <Button variant="destructive" onClick={() => setOpen(true)}>
        Close Season
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Close Current Season</DialogTitle>
            <DialogDescription>
              This will apply ELO bonuses, revoke all licenses, and start a new season.
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          {rewardsPreview.length > 0 && (
            <div className="py-2 space-y-2">
              <p className="text-sm font-medium">Rewards to be applied:</p>
              {rewardsPreview.map((r) => (
                <div key={r.driverId} className="flex items-center justify-between text-sm">
                  <span className="font-mono text-xs text-muted-foreground">{r.driverId.slice(0, 8)}…</span>
                  <div className="flex items-center gap-2">
                    {r.title && <Badge variant="outline">{r.title}</Badge>}
                    {r.eloBonus > 0 && (
                      <span className="text-green-600 font-mono">+{r.eloBonus} ELO</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {done && (
            <p className="text-sm text-green-600 font-medium">Season closed successfully!</p>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button
              variant="destructive"
              onClick={handleClose}
              disabled={loading || done}
            >
              {loading ? 'Closing…' : done ? 'Done' : 'Confirm Close Season'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
