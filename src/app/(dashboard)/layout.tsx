import Link from 'next/link'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { Separator } from '@/components/ui/separator'
import { LogoutButton } from '@/components/shared/LogoutButton'
import { SidebarNav } from '@/components/shared/SidebarNav'
import { Settings } from 'lucide-react'
import type { NavItem } from '@/components/shared/SidebarNav'

const adminNavItems: NavItem[] = [
  { href: '/ranking',    label: 'Ranking',    icon: 'Trophy' },
  { href: '/races',      label: 'Races',      icon: 'Flag' },
  { href: '/circuits',   label: 'Circuits',   icon: 'MapPin' },
  { href: '/challenges', label: 'Challenges', icon: 'Zap' },
  { href: '/drivers',    label: 'Drivers',    icon: 'Car' },
  { href: '/season',     label: 'Season',     icon: 'Calendar' },
]

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}): Promise<React.JSX.Element> {
  const session = await auth()
  if (!session) redirect('/login')

  const role = session.user?.role

  // Vue racer — header dramatique
  if (role === 'racer') {
    const driverId = session.user?.driverId
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b border-border bg-card px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="racing-stripe h-8 w-1.5 rounded-full" />
            <div>
              <h1
                className="font-black text-xl tracking-widest text-primary uppercase leading-none"
                style={{ fontFamily: 'var(--font-orbitron)' }}
              >
                RACEORDIE
              </h1>
              <p className="text-[10px] text-muted-foreground font-mono tracking-widest mt-0.5 uppercase">
                Underground Racing ELO
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {driverId && (
              <Link
                href="/profile"
                className="text-xs font-mono tracking-widest uppercase text-muted-foreground hover:text-primary transition-colors"
              >
                Mon Profil
              </Link>
            )}
            <LogoutButton />
          </div>
        </header>
        <main className="p-8">{children}</main>
      </div>
    )
  }

  // Vue admin — sidebar complète
  return (
    <div className="flex min-h-screen bg-background">
      <aside className="w-60 border-r border-border bg-sidebar flex flex-col shrink-0">
        {/* Racing stripe accent */}
        <div className="racing-stripe h-1 w-full" />

        {/* Brand */}
        <div className="px-5 py-4">
          <h1
            className="font-black text-lg tracking-widest text-primary uppercase leading-none"
            style={{ fontFamily: 'var(--font-orbitron)' }}
          >
            RACEORDIE
          </h1>
          <p className="text-[10px] text-muted-foreground font-mono tracking-widest mt-1.5 uppercase">
            Underground Racing ELO
          </p>
        </div>

        <Separator className="bg-border" />

        <SidebarNav items={adminNavItems} />

        <Separator className="bg-border" />

        {/* Footer */}
        <div className="p-3 space-y-1">
          <div className="flex items-center gap-2.5 px-3 py-1.5">
            <Settings size={14} className="text-muted-foreground" strokeWidth={1.8} />
            <span className="text-xs text-muted-foreground font-mono">Admin</span>
          </div>
          <LogoutButton />
        </div>
      </aside>

      <main className="flex-1 p-8 overflow-y-auto">{children}</main>
    </div>
  )
}
