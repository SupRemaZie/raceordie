import Link from 'next/link'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
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
  showBalance?: boolean
}

export function RankingTable({ drivers, showBalance = true }: RankingTableProps): React.JSX.Element {
  const colSpan = showBalance ? 4 : 3

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-12">#</TableHead>
          <TableHead>Driver</TableHead>
          <TableHead>ELO</TableHead>
          {showBalance && <TableHead>Balance</TableHead>}
        </TableRow>
      </TableHeader>
      <TableBody>
        {drivers.length === 0 ? (
          <TableRow>
            <TableCell colSpan={colSpan} className="text-center text-muted-foreground py-8">
              No licensed drivers this season
            </TableCell>
          </TableRow>
        ) : (
          drivers.map((driver, idx) => {
            const pos = idx + 1
            const medals: Record<number, string> = { 1: '🥇', 2: '🥈', 3: '🥉' }
            const isTop3 = pos <= 3
            const rowClass =
              pos === 1 ? 'bg-yellow-500/10 border-l-2 border-yellow-500' :
              pos === 2 ? 'bg-zinc-400/10 border-l-2 border-zinc-400' :
              pos === 3 ? 'bg-amber-700/10 border-l-2 border-amber-700' :
              ''
            const textSize = isTop3 ? 'text-base' : 'text-sm'

            return (
              <TableRow key={driver.id} className={rowClass}>
                <TableCell className={`font-bold ${isTop3 ? 'text-lg' : ''}`}>
                  {medals[pos] ?? <span className="text-muted-foreground">{pos}</span>}
                </TableCell>
                <TableCell>
                  <Link href={`/drivers/${driver.id}`} className={`hover:underline font-semibold ${textSize}`}>
                    {driver.name}
                  </Link>
                </TableCell>
                <TableCell className={`font-mono font-bold ${textSize}`}>{driver.elo}</TableCell>
                {showBalance && (
                  <TableCell>
                    <MoneyDisplay amount={driver.balance} />
                  </TableCell>
                )}
              </TableRow>
            )
          })
        )}
      </TableBody>
    </Table>
  )
}
