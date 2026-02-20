'use client'

import { signOut } from 'next-auth/react'
import { Button } from '@/components/ui/button'

export function LogoutButton(): React.JSX.Element {
  return (
    <Button
      variant="ghost"
      size="sm"
      className="w-full justify-start gap-2 text-muted-foreground hover:text-destructive hover:bg-sidebar-accent px-3"
      onClick={() => signOut({ callbackUrl: '/login' })}
    >
      <span>🚪</span>
      <span className="text-xs font-mono">Déconnexion</span>
    </Button>
  )
}
