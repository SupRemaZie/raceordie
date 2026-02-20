import { notFound } from 'next/navigation'
import { DriverProfile } from '@/components/driver/DriverProfile'
import { PageHeader } from '@/components/shared/PageHeader'
import { prisma } from '@/lib/prisma'

export default async function DriverDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}): Promise<React.JSX.Element> {
  const { id } = await params
  const driver = await prisma.driver.findUnique({ where: { id } })

  if (!driver) notFound()

  return (
    <div>
      <PageHeader title={driver.name} description={`Driver profile — [${driver.tag}]`} />
      <DriverProfile driver={driver} />
    </div>
  )
}
