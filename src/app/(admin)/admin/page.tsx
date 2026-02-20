import { PageHeader } from '@/components/shared/PageHeader'
import { AdminStatCard } from '@/components/admin/AdminStatCard'
import { MoneyDisplay } from '@/components/shared/MoneyDisplay'
import { seasonService } from '@/lib/container'
import { prisma } from '@/lib/prisma'

export default async function AdminDashboardPage(): Promise<React.JSX.Element> {
  const [stats, driverCount, raceCount] = await Promise.all([
    seasonService.getStats(),
    prisma.driver.count(),
    prisma.race.count(),
  ])

  return (
    <div>
      <PageHeader title="Admin Dashboard" description="Global platform overview" />
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <AdminStatCard label="Season" value={`#${stats.season}`} />
        <AdminStatCard label="Total Drivers" value={driverCount} />
        <AdminStatCard label="Total Races" value={raceCount} />
        <AdminStatCard label="Challenges" value={stats.totalChallenges} />
        <AdminStatCard label="Final Pot" value={<MoneyDisplay amount={stats.finalPot} />} />
      </div>
    </div>
  )
}
