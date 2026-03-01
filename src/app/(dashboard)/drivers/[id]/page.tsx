import { notFound } from 'next/navigation'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { DriverProfile } from '@/components/driver/DriverProfile'
import { EditDriverForm } from '@/components/driver/EditDriverForm'
import { ArchiveButton } from '@/components/driver/ArchiveButton'
import { DeleteButton } from '@/components/shared/DeleteButton'
import { SetDriverCodeForm } from '@/components/driver/SetDriverCodeForm'

export default async function DriverDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}): Promise<React.JSX.Element> {
  const session = await auth()
  const isAdmin = session?.user?.role === 'admin'

  const { id } = await params

  const [driver, activeDrivers] = await Promise.all([
    prisma.driver.findUnique({ where: { id } }),
    prisma.driver.findMany({
      where: { archived: false },
      orderBy: { elo: 'desc' },
      select: { id: true },
    }),
  ])
  if (!driver) notFound()

  const rank = activeDrivers.findIndex((d) => d.id === id) + 1
  const total = activeDrivers.length

  return (
    <div className="space-y-8 max-w-3xl">
      {/* Admin actions — discrets, en haut à droite */}
      {isAdmin && (
        <div className="flex justify-end gap-2">
          <ArchiveButton driverId={id} archived={driver.archived} />
          <DeleteButton
            url={`/api/drivers/${id}`}
            redirectTo="/drivers"
            confirmMessage={`Supprimer le pilote "${driver.name}" ? Ses résultats seront également supprimés.`}
          />
        </div>
      )}

      <DriverProfile
        driver={driver}
        rank={rank > 0 ? rank : undefined}
        total={total}
      />

      {isAdmin && <EditDriverForm driver={{ id: driver.id, name: driver.name }} />}
      {isAdmin && <SetDriverCodeForm driverId={driver.id} currentCode={driver.loginCode} />}
    </div>
  )
}
