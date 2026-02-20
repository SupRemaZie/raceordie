import Link from 'next/link'
import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'

const navItems = [
  { href: '/admin', label: 'Dashboard' },
  { href: '/admin/drivers', label: 'Drivers' },
  { href: '/admin/challenges', label: 'Challenges' },
  { href: '/admin/season', label: 'Season' },
]

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}): Promise<React.JSX.Element> {
  const session = await auth()
  if (!session) redirect('/login')
  if (session.user?.name !== process.env.ADMIN_USERNAME) redirect('/ranking')

  return (
    <div className="flex min-h-screen">
      <aside className="w-56 border-r bg-background flex flex-col">
        <div className="p-4">
          <div className="flex items-center gap-2">
            <h1 className="font-black text-xl tracking-tight">RACEORDIE</h1>
            <Badge variant="destructive" className="text-xs">ADMIN</Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-1">Management Console</p>
        </div>
        <Separator />
        <nav className="flex-1 p-3 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="block px-3 py-2 rounded-md text-sm hover:bg-muted transition-colors"
            >
              {item.label}
            </Link>
          ))}
          <Separator className="my-2" />
          <Link
            href="/ranking"
            className="block px-3 py-2 rounded-md text-sm text-muted-foreground hover:bg-muted transition-colors"
          >
            ← Back to App
          </Link>
        </nav>
        <Separator />
        <div className="p-4 text-xs text-muted-foreground font-mono">{session.user?.name}</div>
      </aside>

      <main className="flex-1 p-8 overflow-y-auto">{children}</main>
    </div>
  )
}
