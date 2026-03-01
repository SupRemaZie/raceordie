'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Trophy, Flag, MapPin, Zap, Car, Calendar,
  LayoutDashboard, Settings,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

const ICON_MAP: Record<string, LucideIcon> = {
  Trophy, Flag, MapPin, Zap, Car, Calendar,
  LayoutDashboard, Settings,
}

export interface NavItem {
  href: string
  label: string
  icon: keyof typeof ICON_MAP
}

interface SidebarNavProps {
  items: NavItem[]
}

export function SidebarNav({ items }: SidebarNavProps): React.JSX.Element {
  const pathname = usePathname()

  return (
    <nav className="flex-1 p-3 space-y-0.5">
      {items.map((item) => {
        const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
        const Icon = ICON_MAP[item.icon]
        return (
          <Link
            key={item.href}
            href={item.href}
            className={[
              'flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-all duration-150',
              isActive
                ? 'nav-active'
                : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-primary pl-[14px]',
            ].join(' ')}
          >
            {Icon && (
              <Icon
                size={16}
                className={isActive ? 'text-primary' : 'text-muted-foreground'}
                strokeWidth={isActive ? 2.5 : 1.8}
              />
            )}
            <span className="tracking-wide">{item.label}</span>
          </Link>
        )
      })}
    </nav>
  )
}
