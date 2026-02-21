import Link from 'next/link'
import { auth } from '@/lib/auth'
import { PageHeader } from '@/components/shared/PageHeader'
import { RaceCard } from '@/components/race/RaceCard'
import { Button } from '@/components/ui/button'
import { prisma } from '@/lib/prisma'

export default async function RacesPage(): Promise<React.JSX.Element> {
  const session = await auth()
  const isAdmin = session?.user?.role === 'admin'

  const races = await prisma.race.findMany({
    include: { results: true },
    orderBy: { createdAt: 'desc' },
    take: 20,
  })

  return (
    <div>
      <PageHeader
        title="Races"
        action={
          isAdmin ? (
            <Button asChild>
              <Link href="/races/new">+ New Race</Link>
            </Button>
          ) : undefined
        }
      />
      {races.length === 0 ? (
        <p className="text-muted-foreground">No races yet.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {races.map((race) => (
            <RaceCard key={race.id} race={{ ...race, resolvedAt: race.resolvedAt?.toISOString() ?? null }} />
          ))}
        </div>
      )}
    </div>
  )
}
