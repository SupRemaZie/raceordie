import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface AdminStatCardProps {
  label: string
  value: React.ReactNode
  sub?: string
}

export function AdminStatCard({ label, value, sub }: AdminStatCardProps): React.JSX.Element {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm text-muted-foreground font-normal">{label}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-3xl font-bold">{value}</p>
        {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
      </CardContent>
    </Card>
  )
}
