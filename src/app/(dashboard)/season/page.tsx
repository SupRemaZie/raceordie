import { PageHeader } from '@/components/shared/PageHeader'
import { SeasonSummary } from '@/components/season/SeasonSummary'
import { seasonService } from '@/lib/container'

export default async function SeasonPage(): Promise<React.JSX.Element> {
  const stats = await seasonService.getStats()

  return (
    <div>
      <PageHeader
        title="Season Overview"
        description="Current season statistics and end-of-season management"
      />
      <SeasonSummary stats={stats} />
    </div>
  )
}
