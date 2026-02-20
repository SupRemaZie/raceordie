import Link from 'next/link'
import { PageHeader } from '@/components/shared/PageHeader'
import { EloBadge } from '@/components/shared/EloBadge'
import { MoneyDisplay } from '@/components/shared/MoneyDisplay'
import { LicenseButton } from '@/components/admin/LicenseButton'
import { Button } from '@/components/ui/button'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { prisma } from '@/lib/prisma'
import { seasonService } from '@/lib/container'

export default async function AdminDriversPage(): Promise<React.JSX.Element> {
  const season = await seasonService.getStats()
  const drivers = await prisma.driver.findMany({
    orderBy: { elo: 'desc' },
    include: { licenses: { where: { season: season.season } } },
  })

  return (
    <div>
      <PageHeader
        title="Drivers"
        description={`${drivers.length} registered — Season #${season.season}`}
        action={
          <Button asChild>
            <Link href="/admin/drivers/new">+ New Driver</Link>
          </Button>
        }
      />
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>TAG</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>ELO</TableHead>
            <TableHead>Balance</TableHead>
            <TableHead>License</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {drivers.map((d) => (
            <TableRow key={d.id}>
              <TableCell>
                <span className="font-mono font-bold bg-muted px-2 py-0.5 rounded text-sm">
                  {d.tag}
                </span>
              </TableCell>
              <TableCell className="font-medium">{d.name}</TableCell>
              <TableCell><EloBadge elo={d.elo} /></TableCell>
              <TableCell><MoneyDisplay amount={d.balance} /></TableCell>
              <TableCell>
                <LicenseButton driverId={d.id} hasLicense={d.licenses.length > 0} />
              </TableCell>
            </TableRow>
          ))}
          {drivers.length === 0 && (
            <TableRow>
              <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                No drivers yet
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}
