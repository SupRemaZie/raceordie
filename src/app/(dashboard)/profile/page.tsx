import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { DriverProfile } from '@/components/driver/DriverProfile'
import { AvatarUpload } from '@/components/driver/AvatarUpload'

export default async function ProfilePage(): Promise<React.JSX.Element> {
  const session = await auth()
  const driverId = session?.user?.driverId
  if (!driverId) redirect('/ranking')

  const [driver, activeDrivers] = await Promise.all([
    prisma.driver.findUnique({ where: { id: driverId } }),
    prisma.driver.findMany({
      where: { archived: false },
      orderBy: { elo: 'desc' },
      select: { id: true },
    }),
  ])

  if (!driver) redirect('/ranking')

  const rank = activeDrivers.findIndex((d) => d.id === driverId) + 1
  const total = activeDrivers.length

  return (
    <div className="space-y-8 max-w-3xl">
      <DriverProfile
        driver={driver}
        rank={rank > 0 ? rank : undefined}
        total={total}
      />
      <AvatarUpload driverId={driverId} currentPhoto={driver.photo} />
    </div>
  )
}
