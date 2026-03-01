import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import { authConfig } from '@/auth.config'
import { prisma } from '@/lib/prisma'

type Role = 'racer' | 'admin'

const ACCESS_CODES: Record<string, Role> = {
  RACER: 'racer',
  shadowracer: 'admin',
}

const RACER_ALLOWED = ['/ranking', '/drivers', '/profile']

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  session: { strategy: 'jwt' },
  providers: [
    Credentials({
      credentials: {
        code: { label: "Code d'accès", type: 'password' },
      },
      async authorize(credentials): Promise<{ id: string; role: Role; driverId?: string } | null> {
        const code = typeof credentials?.code === 'string' ? credentials.code : ''

        // Global codes (admin / shared racer)
        const role = ACCESS_CODES[code]
        if (role) return { id: role, role }

        // Individual driver login code
        const driver = await prisma.driver.findFirst({
          where: { loginCode: code, archived: false },
          select: { id: true },
        })
        if (driver) return { id: driver.id, role: 'racer', driverId: driver.id }

        return null
      },
    }),
  ],
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user
      const role = auth?.user?.role
      const path = nextUrl.pathname

      if (path === '/login') {
        return isLoggedIn
          ? Response.redirect(new URL('/ranking', nextUrl))
          : true
      }

      if (!isLoggedIn) return Response.redirect(new URL('/login', nextUrl))

      if (role === 'admin') return true

      if (role === 'racer') {
        const allowed = RACER_ALLOWED.some((p) => path === p || path.startsWith(p + '/'))
        return allowed ? true : Response.redirect(new URL('/ranking', nextUrl))
      }

      return Response.redirect(new URL('/login', nextUrl))
    },
    jwt({ token, user }) {
      if (user?.role) token.role = user.role
      if (user?.driverId) token.driverId = user.driverId
      return token
    },
    session({ session, token }) {
      if (token.role) session.user.role = token.role as Role
      if (token.driverId) session.user.driverId = token.driverId as string
      return session
    },
  },
})
