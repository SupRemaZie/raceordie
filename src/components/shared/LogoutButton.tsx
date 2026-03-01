'use client'

import { signOut } from 'next-auth/react'
import { LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface LogoutButtonProps {
  sidebar?: boolean
}

export function LogoutButton({ sidebar = false }: LogoutButtonProps): React.JSX.Element {
  if (sidebar) {
    return (
      <Button
        variant="ghost"
        size="sm"
        className="w-full justify-start gap-2 text-muted-foreground hover:text-destructive hover:bg-sidebar-accent px-3"
        onClick={() => signOut({ callbackUrl: '/login' })}
      >
        <LogOut size={14} strokeWidth={1.8} />
        <span className="text-xs font-mono">Déconnexion</span>
      </Button>
    )
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      className="gap-2 text-muted-foreground hover:text-destructive"
      onClick={() => signOut({ callbackUrl: '/login' })}
    >
      <LogOut size={14} strokeWidth={1.8} />
      <span className="text-xs font-mono tracking-widest uppercase">Quitter</span>
    </Button>
  )
}
