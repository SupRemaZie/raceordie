import Link from 'next/link'
import { auth } from '@/lib/auth'
import { PageHeader } from '@/components/shared/PageHeader'
import { DriversTable } from '@/components/driver/DriversTable'
import { Button } from '@/components/ui/button'
import { prisma } from '@/lib/prisma'

export default async function DriversPage(): Promise<React.JSX.Element> {
  const session = await auth()
  const isAdmin = session?.user?.role === 'admin'

  const drivers = await prisma.driver.findMany({ orderBy: { elo: 'desc' } })

  return (
    <div>
      <PageHeader
        title="Drivers"
        description="All registered drivers"
        action={
          isAdmin
            ? <Button asChild><Link href="/drivers/new">+ New Driver</Link></Button>
            : undefined
        }
      />
      <DriversTable drivers={drivers} isAdmin={isAdmin} />
    </div>
  )
}
