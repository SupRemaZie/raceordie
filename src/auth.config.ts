import type { NextAuthConfig } from 'next-auth'

// Edge-safe config — no Node.js-only imports (no bcrypt, no prisma)
export const authConfig: NextAuthConfig = {
  pages: {
    signIn: '/login',
  },
  providers: [],
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user
      const isDashboard =
        nextUrl.pathname.startsWith('/ranking') ||
        nextUrl.pathname.startsWith('/races') ||
        nextUrl.pathname.startsWith('/challenges') ||
        nextUrl.pathname.startsWith('/drivers') ||
        nextUrl.pathname.startsWith('/season')

      const isAdminRoute =
        nextUrl.pathname.startsWith('/admin') ||
        nextUrl.pathname.startsWith('/api/admin')

      if (isDashboard || isAdminRoute) {
        if (isLoggedIn) return true
        return false // redirect to login — email check happens in layout
      }

      if (isLoggedIn && (nextUrl.pathname === '/login' || nextUrl.pathname === '/register')) {
        return Response.redirect(new URL('/ranking', nextUrl))
      }

      return true
    },
  },
}
