import { PageHeader } from '@/components/shared/PageHeader'
import { RankingTable } from '@/components/ranking/RankingTable'
import { driverService } from '@/lib/container'
import { auth } from '@/lib/auth'

export default async function RankingPage(): Promise<React.JSX.Element> {
  const [drivers, session] = await Promise.all([driverService.getRanking(), auth()])
  const isRacer = session?.user?.role === 'racer'

  return (
    <div>
      <PageHeader
        title="ELO Ranking"
        description="Active drivers"
      />
      <RankingTable drivers={drivers} showBalance={!isRacer} />
    </div>
  )
}
