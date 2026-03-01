import { notFound, redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { PageHeader } from '@/components/shared/PageHeader'
import { ChallengeActions } from '@/components/challenge/ChallengeActions'
import { DeleteButton } from '@/components/shared/DeleteButton'
import { Badge } from '@/components/ui/badge'
import { MoneyDisplay } from '@/components/shared/MoneyDisplay'

export default async function ChallengeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}): Promise<React.JSX.Element> {
  const session = await auth()
  if (session?.user?.role !== 'admin') redirect('/challenges')

  const { id } = await params
  const challenge = await prisma.challenge.findUnique({
    where: { id },
    include: {
      player1: { select: { id: true, name: true } },
      player2: { select: { id: true, name: true } },
      winner: { select: { id: true, name: true } },
    },
  })
  if (!challenge) notFound()

  const canDelete = challenge.status !== 'RESOLVED'

  return (
    <div className="space-y-8 max-w-xl">
      <div className="flex items-start justify-between">
        <PageHeader
          title={`Challenge — ${challenge.player1.name} vs ${challenge.player2.name}`}
          description={`Saison ${challenge.season}`}
        />
        {canDelete && (
          <DeleteButton
            url={`/api/challenges/${id}`}
            redirectTo="/challenges"
            confirmMessage="Supprimer ce challenge ?"
          />
        )}
      </div>

      {/* Info */}
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <Badge variant={
            challenge.status === 'PENDING' ? 'outline'
            : challenge.status === 'ACTIVE' ? 'secondary'
            : challenge.status === 'RESOLVED' ? 'default'
            : 'destructive'
          }>
            {challenge.status}
          </Badge>
        </div>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground text-xs mb-1">Joueur 1</p>
            <p className="font-medium">{challenge.player1.name}</p>
          </div>
          <div>
            <p className="text-muted-foreground text-xs mb-1">Joueur 2</p>
            <p className="font-medium">{challenge.player2.name}</p>
          </div>
          <div>
            <p className="text-muted-foreground text-xs mb-1">Mise (chacun)</p>
            <MoneyDisplay amount={challenge.stake} />
          </div>
          <div>
            <p className="text-muted-foreground text-xs mb-1">Prize pool</p>
            <MoneyDisplay amount={challenge.winnerPrize} />
          </div>
        </div>
        {challenge.winner && (
          <p className="text-sm">
            Vainqueur : <span className="font-semibold text-primary">{challenge.winner.name}</span>
          </p>
        )}
      </div>

      {/* Actions */}
      <ChallengeActions
        challengeId={id}
        status={challenge.status}
        player1={{ id: challenge.player1.id, name: challenge.player1.name }}
        player2={{ id: challenge.player2.id, name: challenge.player2.name }}
      />
    </div>
  )
}
