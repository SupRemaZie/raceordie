import Link from 'next/link'
import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { LogoutButton } from '@/components/shared/LogoutButton'

const navItems = [
  { href: '/admin',            label: 'Dashboard',  icon: '📊' },
  { href: '/admin/drivers',    label: 'Drivers',    icon: '🚗' },
  { href: '/admin/challenges', label: 'Challenges', icon: '⚡' },
  { href: '/admin/season',     label: 'Season',     icon: '📅' },
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
    <div className="flex min-h-screen bg-background">
      <aside className="w-56 border-r border-border bg-sidebar flex flex-col">
        {/* Racing stripe accent */}
        <div className="racing-stripe h-1 w-full" />

        {/* Brand */}
        <div className="p-4 pb-3">
          <div className="flex items-center gap-2">
            <h1
              className="font-black text-lg tracking-widest text-primary uppercase"
              style={{ fontFamily: 'var(--font-orbitron)' }}
            >
              RACEORDIE
            </h1>
            <Badge variant="destructive" className="text-[10px] px-1.5 py-0">ADMIN</Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5 font-mono">🔧 Management Console</p>
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
          <Separator className="my-2 bg-border" />
          <Link
            href="/ranking"
            className="flex items-center gap-2.5 px-3 py-2 rounded-md text-sm text-muted-foreground hover:bg-sidebar-accent hover:text-primary transition-colors"
          >
            <span>←</span> Back to App
          </Link>
        </nav>

        <Separator className="bg-border" />

        <div className="p-3 space-y-1">
          <div className="flex items-center gap-2 px-3 py-1">
            <span className="text-lg">👤</span>
            <span className="text-xs text-muted-foreground font-mono truncate">
              {session.user?.name}
            </span>
          </div>
          <LogoutButton />
        </div>
      </aside>

      <main className="flex-1 p-8 overflow-y-auto">{children}</main>
    </div>
  )
}
