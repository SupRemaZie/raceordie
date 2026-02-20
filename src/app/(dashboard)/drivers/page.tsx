import Link from 'next/link'
import { PageHeader } from '@/components/shared/PageHeader'
import { DataTable } from '@/components/shared/DataTable'
import { EloBadge } from '@/components/shared/EloBadge'
import { MoneyDisplay } from '@/components/shared/MoneyDisplay'
import { prisma } from '@/lib/prisma'

export default async function DriversPage(): Promise<React.JSX.Element> {
  const drivers = await prisma.driver.findMany({ orderBy: { elo: 'desc' } })

  const columns = [
    {
      key: 'tag',
      header: 'TAG',
      render: (d: typeof drivers[0]) => (
        <span className="font-mono font-bold bg-muted px-2 py-0.5 rounded text-sm">{d.tag}</span>
      ),
    },
    {
      key: 'name',
      header: 'Name',
      render: (d: typeof drivers[0]) => (
        <Link href={`/drivers/${d.id}`} className="hover:underline font-medium">{d.name}</Link>
      ),
    },
    {
      key: 'elo',
      header: 'ELO',
      render: (d: typeof drivers[0]) => <EloBadge elo={d.elo} />,
    },
    {
      key: 'balance',
      header: 'Balance',
      render: (d: typeof drivers[0]) => <MoneyDisplay amount={d.balance} />,
    },
  ]

  return (
    <div>
      <PageHeader title="Drivers" description="All registered drivers" />
      <DataTable columns={columns} data={drivers} rowKey={(d) => d.id} emptyMessage="No drivers yet" />
    </div>
  )
}
