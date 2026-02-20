import { PageHeader } from '@/components/shared/PageHeader'
import { NewRaceForm } from '@/components/race/NewRaceForm'
import { prisma } from '@/lib/prisma'

export default async function NewRacePage(): Promise<React.JSX.Element> {
  const drivers = await prisma.driver.findMany({ orderBy: { name: 'asc' } })

  return (
    <div>
      <PageHeader title="New Race" description="Record race results and update ELO" />
      <NewRaceForm drivers={drivers} />
    </div>
  )
}
