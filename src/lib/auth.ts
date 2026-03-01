import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { authConfig } from '@/auth.config'
import { prisma } from '@/lib/prisma'

type Role = 'racer' | 'admin'

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  session: { strategy: 'jwt' },
  providers: [
    Credentials({
      credentials: {
        code: { label: "Code d'accès", type: 'password' },
      },
      async authorize(credentials): Promise<{ id: string; role: Role; name?: string; driverId?: string } | null> {
        const code = typeof credentials?.code === 'string' ? credentials.code : ''
        if (!code) return null

        // 1. Admin — vérifié en DB avec bcrypt
        const adminUser = await prisma.user.findFirst({
          where: { role: 'admin' },
          select: { id: true, username: true, password: true },
        })
        if (adminUser?.password && await bcrypt.compare(code, adminUser.password)) {
          return { id: adminUser.id, role: 'admin', name: adminUser.username ?? 'Admin' }
        }

        // 2. Code racer partagé
        if (code === 'RACER') {
          return { id: 'racer', role: 'racer' }
        }

        // 3. Code personnel d'un pilote
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
    authorized({ auth: session, request: { nextUrl } }) {
      const isLoggedIn = !!session?.user
      const role = session?.user?.role
      const path = nextUrl.pathname

      if (path === '/login') {
        return isLoggedIn
          ? Response.redirect(new URL('/ranking', nextUrl))
          : true
      }

      if (!isLoggedIn) return Response.redirect(new URL('/login', nextUrl))

      if (role === 'admin') return true

      if (role === 'racer') {
        const RACER_ALLOWED = ['/ranking', '/drivers', '/profile']
        const allowed = RACER_ALLOWED.some((p) => path === p || path.startsWith(p + '/'))
        return allowed ? true : Response.redirect(new URL('/ranking', nextUrl))
      }

      return Response.redirect(new URL('/login', nextUrl))
    },
    jwt({ token, user }) {
      if (user?.role) token.role = user.role
      if (user?.name) token.name = user.name
      if ((user as { driverId?: string })?.driverId) {
        token.driverId = (user as { driverId?: string }).driverId
      }
      return token
    },
    session({ session, token }) {
      if (token.role) session.user.role = token.role as Role
      if (token.driverId) session.user.driverId = token.driverId as string
      return session
    },
  },
})
