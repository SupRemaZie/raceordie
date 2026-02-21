import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { PageHeader } from '@/components/shared/PageHeader'
import { NewCircuitForm } from '@/components/circuit/NewCircuitForm'

export default async function NewCircuitPage(): Promise<React.JSX.Element> {
  const session = await auth()
  if (session?.user?.role !== 'admin') redirect('/circuits')

  return (
    <div>
      <PageHeader title="Nouveau circuit" description="Enregistrer un circuit avec ses checkpoints et photos" />
      <NewCircuitForm />
    </div>
  )
}
