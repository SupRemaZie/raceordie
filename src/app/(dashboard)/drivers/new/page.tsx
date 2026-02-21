import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { PageHeader } from '@/components/shared/PageHeader'
import { NewDriverForm } from '@/components/driver/NewDriverForm'

export default async function NewDriverPage(): Promise<React.JSX.Element> {
  const session = await auth()
  if (session?.user?.role !== 'admin') redirect('/drivers')

  return (
    <div>
      <PageHeader title="Nouveau racer" description="Créer un profil de pilote" />
      <NewDriverForm />
    </div>
  )
}
