'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { DataTable } from '@/components/shared/DataTable'
import { EloBadge } from '@/components/shared/EloBadge'
import { MoneyDisplay } from '@/components/shared/MoneyDisplay'
import { Badge } from '@/components/ui/badge'

interface Driver {
  id: string
  tag: string
  name: string
  elo: number
  balance: number
  archived: boolean
}

interface DriversTableProps {
  drivers: Driver[]
  isAdmin: boolean
}

function ArchiveRowButton({ driver }: { driver: Driver }): React.JSX.Element {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function toggle(): Promise<void> {
    setLoading(true)
    await fetch(`/api/drivers/${driver.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: driver.archived ? 'unarchive' : 'archive' }),
    })
    router.refresh()
    setLoading(false)
  }

  return (
    <Button variant="ghost" size="sm" onClick={toggle} disabled={loading}
      className="text-xs text-muted-foreground hover:text-foreground">
      {loading ? '…' : driver.archived ? '↩ Désarchiver' : '📦 Archiver'}
    </Button>
  )
}

export function DriversTable({ drivers, isAdmin }: DriversTableProps): React.JSX.Element {
  const [query, setQuery] = useState('')
  const [showArchived, setShowArchived] = useState(false)

  const match = (d: Driver): boolean =>
    !query.trim() ||
    d.name.toLowerCase().includes(query.toLowerCase()) ||
    d.tag.toLowerCase().includes(query.toLowerCase())

  const active = drivers.filter((d) => !d.archived && match(d))
  const archived = drivers.filter((d) => d.archived && match(d))

  const columns = [
    {
      key: 'name',
      header: 'Name',
      render: (d: Driver) => (
        <Link href={`/drivers/${d.id}`} className="hover:underline font-medium">{d.name}</Link>
      ),
    },
    {
      key: 'tag',
      header: 'Tag',
      render: (d: Driver) => (
        <span className="font-mono text-xs bg-muted px-2 py-0.5 rounded">{d.tag}</span>
      ),
    },
    {
      key: 'elo',
      header: 'ELO',
      render: (d: Driver) => <EloBadge elo={d.elo} />,
    },
    {
      key: 'balance',
      header: 'Balance',
      render: (d: Driver) => <MoneyDisplay amount={d.balance} />,
    },
    ...(isAdmin ? [{
      key: 'actions',
      header: '',
      render: (d: Driver) => <ArchiveRowButton driver={d} />,
    }] : []),
  ]

  return (
    <div className="space-y-6">
      <Input
        placeholder="Rechercher par nom ou tag…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="max-w-sm"
      />

      <DataTable
        columns={columns}
        data={active}
        rowKey={(d) => d.id}
        emptyMessage={query ? 'Aucun résultat' : 'No drivers yet'}
      />

      {archived.length > 0 && (
        <div className="space-y-2">
          <button
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            onClick={() => setShowArchived((v) => !v)}
          >
            <span>{showArchived ? '▾' : '▸'}</span>
            <Badge variant="secondary">{archived.length}</Badge>
            Pilotes archivés
          </button>
          {showArchived && (
            <div className="opacity-60">
              <DataTable
                columns={columns}
                data={archived}
                rowKey={(d) => d.id}
                emptyMessage=""
              />
            </div>
          )}
        </div>
      )}
    </div>
  )
}
