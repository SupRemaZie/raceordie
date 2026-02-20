import Link from 'next/link'
import { DataTable } from '@/components/shared/DataTable'
import { EloBadge } from '@/components/shared/EloBadge'
import { MoneyDisplay } from '@/components/shared/MoneyDisplay'

interface Driver {
  id: string
  tag: string
  name: string
  elo: number
  balance: number
}

interface RankingTableProps {
  drivers: Driver[]
}

export function RankingTable({ drivers }: RankingTableProps): React.JSX.Element {
  const columns = [
    {
      key: 'position',
      header: '#',
      render: (_: Driver, idx?: number) => (
        <span className="font-bold text-muted-foreground">{(idx ?? 0) + 1}</span>
      ),
    },
    {
      key: 'tag',
      header: 'TAG',
      render: (d: Driver) => (
        <span className="font-mono font-bold text-sm bg-muted px-2 py-0.5 rounded">{d.tag}</span>
      ),
    },
    {
      key: 'name',
      header: 'Driver',
      render: (d: Driver) => (
        <Link href={`/drivers/${d.id}`} className="hover:underline font-medium">
          {d.name}
        </Link>
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
  ]

  return (
    <DataTable
      columns={columns.map((col) => ({
        ...col,
        render: (row: Driver) => col.render(row),
      }))}
      data={drivers}
      rowKey={(d) => d.id}
      emptyMessage="No drivers with a license this season"
    />
  )
}
