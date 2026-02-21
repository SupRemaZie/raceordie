import Image from 'next/image'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface CircuitCardProps {
  id: string
  name: string
  checkpoints: string[]
  photos: string[]
}

export function CircuitCard({ name, checkpoints, photos }: CircuitCardProps): React.JSX.Element {
  const cover = photos[0]

  return (
    <Card className="overflow-hidden">
      {cover && (
        <div className="relative w-full h-40">
          <Image src={cover} alt={`Photo de ${name}`} fill className="object-cover" />
        </div>
      )}
      <CardHeader className="pb-2">
        <CardTitle className="text-base">{name}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-xs text-muted-foreground">
          {checkpoints.length} checkpoint{checkpoints.length !== 1 ? 's' : ''}
        </p>
        {checkpoints.length > 0 && (
          <ul className="mt-2 space-y-0.5">
            {checkpoints.map((cp, i) => (
              <li key={i} className="text-xs font-mono text-muted-foreground">
                <span className="text-primary/70">C{i + 1}</span> {cp}
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}
