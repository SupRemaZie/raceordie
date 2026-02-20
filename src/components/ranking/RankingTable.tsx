import Link from 'next/link'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
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
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-12">#</TableHead>
          <TableHead>TAG</TableHead>
          <TableHead>Driver</TableHead>
          <TableHead>ELO</TableHead>
          <TableHead>Balance</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {drivers.length === 0 ? (
          <TableRow>
            <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
              No licensed drivers this season
            </TableCell>
          </TableRow>
        ) : (
          drivers.map((driver, idx) => (
            <TableRow key={driver.id}>
              <TableCell className="font-bold text-muted-foreground">{idx + 1}</TableCell>
              <TableCell>
                <span className="font-mono font-bold text-sm bg-muted px-2 py-0.5 rounded">
                  {driver.tag}
                </span>
              </TableCell>
              <TableCell>
                <Link href={`/drivers/${driver.id}`} className="hover:underline font-medium">
                  {driver.name}
                </Link>
              </TableCell>
              <TableCell>
                <EloBadge elo={driver.elo} />
              </TableCell>
              <TableCell>
                <MoneyDisplay amount={driver.balance} />
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  )
}
