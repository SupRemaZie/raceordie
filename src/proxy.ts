import NextAuth from 'next-auth'
import { authConfig } from '@/auth.config'

// Uses only edge-safe config — no Node.js crypto, no Prisma
export default NextAuth(authConfig).auth

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
