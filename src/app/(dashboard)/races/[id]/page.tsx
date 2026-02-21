import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { PageHeader } from '@/components/shared/PageHeader'
import { RaceDetail } from '@/components/race/RaceDetail'

export default async function RaceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}): Promise<React.JSX.Element> {
  const { id } = await params

  const race = await prisma.race.findUnique({
    where: { id },
    include: { results: { include: { driver: true } } },
  })

  if (!race) notFound()

  const isPending = !race.resolvedAt

  return (
    <div>
      <PageHeader
        title={race.name || (isPending ? 'Course en attente' : 'Course terminée')}
        description={`${isPending ? 'En attente' : 'Terminée'} · Commission ${(race.commissionRate * 100).toFixed(0)}% · Saison ${race.season}`}
      />
      <RaceDetail race={race} />
    </div>
  )
}
