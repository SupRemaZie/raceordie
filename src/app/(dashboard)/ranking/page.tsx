import { PageHeader } from '@/components/shared/PageHeader'
import { RankingTable } from '@/components/ranking/RankingTable'
import { driverService } from '@/lib/container'

export default async function RankingPage(): Promise<React.JSX.Element> {
  const drivers = await driverService.getRanking()

  return (
    <div>
      <PageHeader
        title="ELO Ranking"
        description="Licensed drivers this season"
      />
      <RankingTable drivers={drivers} />
    </div>
  )
}
