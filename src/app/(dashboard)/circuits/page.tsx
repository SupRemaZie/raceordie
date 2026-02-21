import Link from 'next/link'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { PageHeader } from '@/components/shared/PageHeader'
import { CircuitCard } from '@/components/circuit/CircuitCard'
import { Button } from '@/components/ui/button'

export default async function CircuitsPage(): Promise<React.JSX.Element> {
  const session = await auth()
  const isAdmin = session?.user?.role === 'admin'

  const circuits = await prisma.circuit.findMany({ orderBy: { name: 'asc' } })

  return (
    <div>
      <PageHeader
        title="Circuits"
        description="Circuits enregistrés avec leurs checkpoints et photos"
        action={
          isAdmin
            ? <Button asChild><Link href="/circuits/new">+ Nouveau circuit</Link></Button>
            : undefined
        }
      />

      {circuits.length === 0 ? (
        <p className="text-muted-foreground mt-4">Aucun circuit enregistré.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
          {circuits.map((c) => (
            <CircuitCard key={c.id} {...c} />
          ))}
        </div>
      )}
    </div>
  )
}
