import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { PageHeader } from '@/components/shared/PageHeader'
import { NewRaceForm } from '@/components/race/NewRaceForm'
import { prisma } from '@/lib/prisma'

export default async function NewRacePage(): Promise<React.JSX.Element> {
  const session = await auth()
  if (session?.user?.role !== 'admin') redirect('/races')

  const [drivers, circuits] = await Promise.all([
    prisma.driver.findMany({ orderBy: { name: 'asc' } }),
    prisma.circuit.findMany({
      select: { id: true, name: true, checkpoints: true },
      orderBy: { name: 'asc' },
    }),
  ])

  return (
    <div>
      <PageHeader title="New Race" description="Record race results and update ELO" />
      <NewRaceForm drivers={drivers} circuits={circuits} />
    </div>
  )
}
