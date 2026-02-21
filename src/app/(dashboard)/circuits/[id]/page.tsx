import { notFound, redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { PageHeader } from '@/components/shared/PageHeader'
import { EditCircuitForm } from '@/components/circuit/EditCircuitForm'
import { DeleteButton } from '@/components/shared/DeleteButton'

export default async function CircuitDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}): Promise<React.JSX.Element> {
  const session = await auth()
  if (session?.user?.role !== 'admin') redirect('/circuits')

  const { id } = await params
  const circuit = await prisma.circuit.findUnique({ where: { id } })
  if (!circuit) notFound()

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between">
        <PageHeader title={circuit.name} description="Modifier ou supprimer ce circuit" />
        <DeleteButton
          url={`/api/circuits/${id}`}
          redirectTo="/circuits"
          confirmMessage={`Supprimer le circuit "${circuit.name}" ?`}
        />
      </div>
      <EditCircuitForm circuit={circuit} />
    </div>
  )
}
