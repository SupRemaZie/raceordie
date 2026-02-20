import { PageHeader } from '@/components/shared/PageHeader'
import { CreateDriverForm } from '@/components/admin/CreateDriverForm'

export default function AdminNewDriverPage(): React.JSX.Element {
  return (
    <div>
      <PageHeader title="New Driver" description="Register a new driver on the platform" />
      <CreateDriverForm />
    </div>
  )
}
