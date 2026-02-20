import Link from 'next/link'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { Separator } from '@/components/ui/separator'
import { LogoutButton } from '@/components/shared/LogoutButton'

const navItems = [
  { href: '/ranking', label: 'Ranking',    icon: '🏆' },
  { href: '/races',   label: 'Races',      icon: '🏁' },
  { href: '/challenges', label: 'Challenges', icon: '⚡' },
  { href: '/drivers', label: 'Drivers',    icon: '🚗' },
  { href: '/season',  label: 'Season',     icon: '📅' },
]

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}): Promise<React.JSX.Element> {
  const session = await auth()
  if (!session) redirect('/login')

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <aside className="w-56 border-r border-border bg-sidebar flex flex-col">
        {/* Racing stripe accent */}
        <div className="racing-stripe h-1 w-full" />

        {/* Brand */}
        <div className="p-4 pb-3">
          <h1
            className="font-black text-xl tracking-widest text-primary uppercase"
            style={{ fontFamily: 'var(--font-orbitron)' }}
          >
            RACEORDIE
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5 font-mono">
            🚘 Underground Racing ELO
          </p>
        </div>

        <Separator className="bg-border" />

        <nav className="flex-1 p-3 space-y-0.5">
          {navItems.map((item) => (
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

        {/* User + logout */}
        <div className="p-3 space-y-1">
          <div className="flex items-center gap-2 px-3 py-1">
            <span className="text-lg">🎮</span>
            <span className="text-xs text-muted-foreground font-mono truncate">
              {session.user?.name ?? 'unknown'}
            </span>
          </div>
          <LogoutButton />
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-8 overflow-y-auto">
        {children}
      </main>
    </div>
  )
}
