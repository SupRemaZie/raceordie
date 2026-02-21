import Link from 'next/link'
import { auth } from '@/lib/auth'
import { PageHeader } from '@/components/shared/PageHeader'
import { ChallengeCard } from '@/components/challenge/ChallengeCard'
import { Button } from '@/components/ui/button'
import { prisma } from '@/lib/prisma'

export default async function ChallengesPage(): Promise<React.JSX.Element> {
  const session = await auth()
  const isAdmin = session?.user?.role === 'admin'

  const challenges = await prisma.challenge.findMany({
    orderBy: { createdAt: 'desc' },
    take: 20,
  })

  return (
    <div>
      <PageHeader
        title="1v1 Challenges"
        action={
          isAdmin ? (
            <Button asChild>
              <Link href="/challenges/new">+ New Challenge</Link>
            </Button>
          ) : undefined
        }
      />
      {challenges.length === 0 ? (
        <p className="text-muted-foreground">No challenges yet.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {challenges.map((c) => (
            <ChallengeCard key={c.id} challenge={c} />
          ))}
        </div>
      )}
    </div>
  )
}
