import { PageHeader } from '@/components/shared/PageHeader'
import { ChallengeActionsRow } from '@/components/admin/ChallengeActionsRow'
import { MoneyDisplay } from '@/components/shared/MoneyDisplay'
import { Badge } from '@/components/ui/badge'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { prisma } from '@/lib/prisma'

const statusVariant = {
  PENDING: 'outline',
  ACTIVE: 'secondary',
  RESOLVED: 'default',
  CANCELLED: 'destructive',
} as const

export default async function AdminChallengesPage(): Promise<React.JSX.Element> {
  const challenges = await prisma.challenge.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      player1: { select: { id: true, tag: true } },
      player2: { select: { id: true, tag: true } },
    },
  })

  return (
    <div>
      <PageHeader
        title="Challenges"
        description={`${challenges.length} total`}
      />
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Players</TableHead>
            <TableHead>Stake</TableHead>
            <TableHead>Prize</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {challenges.map((c) => (
            <TableRow key={c.id}>
              <TableCell>
                <span className="font-mono font-bold">{c.player1.tag}</span>
                <span className="text-muted-foreground mx-2">vs</span>
                <span className="font-mono font-bold">{c.player2.tag}</span>
              </TableCell>
              <TableCell><MoneyDisplay amount={c.stake} /></TableCell>
              <TableCell><MoneyDisplay amount={c.winnerPrize} /></TableCell>
              <TableCell>
                <Badge variant={statusVariant[c.status]}>{c.status}</Badge>
              </TableCell>
              <TableCell>
                <ChallengeActionsRow
                  challengeId={c.id}
                  status={c.status}
                  player1Id={c.player1.id}
                  player2Id={c.player2.id}
                  player1Tag={c.player1.tag}
                  player2Tag={c.player2.tag}
                />
              </TableCell>
            </TableRow>
          ))}
          {challenges.length === 0 && (
            <TableRow>
              <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                No challenges yet
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}
