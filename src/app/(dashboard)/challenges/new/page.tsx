import { PageHeader } from '@/components/shared/PageHeader'
import { NewChallengeForm } from '@/components/challenge/NewChallengeForm'
import { prisma } from '@/lib/prisma'

export default async function NewChallengePage(): Promise<React.JSX.Element> {
  const drivers = await prisma.driver.findMany({ orderBy: { name: 'asc' } })

  return (
    <div>
      <PageHeader title="New Challenge" description="Create a 1v1 head-to-head race" />
      <NewChallengeForm drivers={drivers} />
    </div>
  )
}
