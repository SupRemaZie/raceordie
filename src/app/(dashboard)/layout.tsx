import Link from 'next/link'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { Separator } from '@/components/ui/separator'

const navItems = [
  { href: '/ranking', label: 'Ranking' },
  { href: '/races', label: 'Races' },
  { href: '/challenges', label: 'Challenges' },
  { href: '/drivers', label: 'Drivers' },
  { href: '/season', label: 'Season' },
]

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}): Promise<React.JSX.Element> {
  const session = await auth()
  if (!session) redirect('/login')

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-56 border-r bg-background flex flex-col">
        <div className="p-4">
          <h1 className="font-black text-xl tracking-tight">RACEORDIE</h1>
          <p className="text-xs text-muted-foreground mt-1">Underground Racing ELO</p>
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
        </nav>
        <Separator />
        <div className="p-4 text-xs text-muted-foreground font-mono">
          {session.user?.name ?? 'unknown'}
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-8 overflow-y-auto">
        {children}
      </main>
    </div>
  )
}
