import Link from 'next/link'
import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { LogoutButton } from '@/components/shared/LogoutButton'
import { SidebarNav } from '@/components/shared/SidebarNav'
import { ArrowLeft } from 'lucide-react'
import type { NavItem } from '@/components/shared/SidebarNav'

const navItems: NavItem[] = [
  { href: '/admin',            label: 'Dashboard',  icon: 'LayoutDashboard' },
  { href: '/admin/drivers',    label: 'Drivers',    icon: 'Car' },
  { href: '/admin/challenges', label: 'Challenges', icon: 'Zap' },
  { href: '/admin/season',     label: 'Season',     icon: 'Calendar' },
]

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}): Promise<React.JSX.Element> {
  const session = await auth()
  if (!session) redirect('/login')
  if (session.user?.name !== process.env.ADMIN_USERNAME) redirect('/ranking')

  const username = session.user?.name ?? 'Admin'
  const initial = username.charAt(0).toUpperCase()

  return (
    <div className="flex min-h-screen bg-background">
      <aside className="w-60 border-r border-border bg-sidebar flex flex-col shrink-0">
        {/* Racing stripe accent */}
        <div className="racing-stripe h-1 w-full" />

        {/* Brand */}
        <div className="px-5 py-4">
          <div className="flex items-center gap-2">
            <h1
              className="font-black text-lg tracking-widest text-primary uppercase leading-none"
              style={{ fontFamily: 'var(--font-orbitron)' }}
            >
              RACEORDIE
            </h1>
            <Badge
              variant="outline"
              className="text-[9px] px-1.5 py-0 border-amber-500/60 text-amber-400 font-mono tracking-widest"
            >
              ADMIN
            </Badge>
          </div>
          <p className="text-[10px] text-muted-foreground font-mono tracking-widest mt-1.5 uppercase">
            Management Console
          </p>
        </div>

        <Separator className="bg-border" />

        <SidebarNav items={navItems} />

        <div className="px-3 pb-2">
          <Separator className="bg-border mb-2" />
          <Link
            href="/ranking"
            className="flex items-center gap-3 px-3 py-2.5 rounded-md text-sm text-muted-foreground hover:bg-sidebar-accent hover:text-primary transition-all duration-150"
          >
            <ArrowLeft size={14} strokeWidth={1.8} />
            <span className="tracking-wide">Back to App</span>
          </Link>
        </div>

        <Separator className="bg-border" />

        {/* User footer */}
        <div className="p-3 space-y-1">
          <div className="flex items-center gap-2.5 px-3 py-1.5">
            <div className="size-6 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center shrink-0">
              <span className="text-[10px] font-bold text-primary">{initial}</span>
            </div>
            <span className="text-xs text-muted-foreground font-mono truncate">
              {username}
            </span>
          </div>
          <LogoutButton />
        </div>
      </aside>

      <main className="flex-1 p-8 overflow-y-auto">{children}</main>
    </div>
  )
}
