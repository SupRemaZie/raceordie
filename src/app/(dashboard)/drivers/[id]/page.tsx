import { notFound } from 'next/navigation'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { PageHeader } from '@/components/shared/PageHeader'
import { DriverProfile } from '@/components/driver/DriverProfile'
import { EditDriverForm } from '@/components/driver/EditDriverForm'
import { ArchiveButton } from '@/components/driver/ArchiveButton'
import { DeleteButton } from '@/components/shared/DeleteButton'
import { Badge } from '@/components/ui/badge'

export default async function DriverDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}): Promise<React.JSX.Element> {
  const session = await auth()
  const isAdmin = session?.user?.role === 'admin'

  const { id } = await params
  const driver = await prisma.driver.findUnique({ where: { id } })
  if (!driver) notFound()

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <PageHeader
            title={driver.name}
            description={`Driver profile — [${driver.tag}]`}
          />
          {driver.archived && (
            <Badge variant="secondary" className="mb-8">Archivé</Badge>
          )}
        </div>
        {isAdmin && (
          <div className="flex gap-2">
            <ArchiveButton driverId={id} archived={driver.archived} />
            <DeleteButton
              url={`/api/drivers/${id}`}
              redirectTo="/drivers"
              confirmMessage={`Supprimer le pilote "${driver.name}" ? Ses résultats seront également supprimés.`}
            />
          </div>
        )}
      </div>
      <DriverProfile driver={driver} />
      {isAdmin && <EditDriverForm driver={{ id: driver.id, name: driver.name }} />}
    </div>
  )
}
