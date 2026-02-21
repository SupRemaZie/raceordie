import Link from 'next/link'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { Separator } from '@/components/ui/separator'
import { LogoutButton } from '@/components/shared/LogoutButton'

const adminNavItems = [
  { href: '/ranking',    label: 'Ranking',    icon: '🏆' },
  { href: '/races',      label: 'Races',      icon: '🏁' },
  { href: '/circuits',   label: 'Circuits',   icon: '🏎️' },
  { href: '/challenges', label: 'Challenges', icon: '⚡' },
  { href: '/drivers',    label: 'Drivers',    icon: '🚗' },
  { href: '/season',     label: 'Season',     icon: '📅' },
]

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}): Promise<React.JSX.Element> {
  const session = await auth()
  if (!session) redirect('/login')

  const role = session.user?.role

  // Vue racer 
  if (role === 'racer') {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b border-border bg-card px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="racing-stripe h-5 w-1 rounded" />
            <h1
              className="font-black text-lg tracking-widest text-primary uppercase"
              style={{ fontFamily: 'var(--font-orbitron)' }}
            >
              RACEORDIE
            </h1>
          </div>
          <LogoutButton />
        </header>
        <main className="p-8">{children}</main>
      </div>
    )
  }

  // Vue admin : sidebar complète
  return (
    <div className="flex min-h-screen bg-background">
      <aside className="w-56 border-r border-border bg-sidebar flex flex-col">
        <div className="racing-stripe h-1 w-full" />
        <div className="p-4 pb-3">
          <h1
            className="font-black text-xl tracking-widest text-primary uppercase"
            style={{ fontFamily: 'var(--font-orbitron)' }}
          >
            RACEORDIE
          </h1>
  
        </div>
        <Separator className="bg-border" />
        <nav className="flex-1 p-3 space-y-0.5">
          {adminNavItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-2.5 px-3 py-2 rounded-md text-sm font-medium text-sidebar-foreground hover:bg-sidebar-accent hover:text-primary transition-colors"
            >
              <span className="text-base leading-none">{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>
        <Separator className="bg-border" />
        <div className="p-3 space-y-1">
          <div className="flex items-center gap-2 px-3 py-1">
            <span className="text-lg">🔧</span>
            <span className="text-xs text-muted-foreground font-mono">Admin</span>
          </div>
          <LogoutButton />
        </div>
      </aside>
      <main className="flex-1 p-8 overflow-y-auto">{children}</main>
    </div>
  )
}
