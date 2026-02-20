import { auth } from '@/lib/auth'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export default auth((req: NextRequest & { auth: unknown }) => {
  const { pathname } = req.nextUrl

  const isAuth = !!req.auth
  const isAuthRoute = pathname.startsWith('/login') || pathname.startsWith('/register')
  const isDashboard = pathname.startsWith('/ranking') ||
    pathname.startsWith('/races') ||
    pathname.startsWith('/challenges') ||
    pathname.startsWith('/drivers') ||
    pathname.startsWith('/season')

  if (!isAuth && isDashboard) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  if (isAuth && isAuthRoute) {
    return NextResponse.redirect(new URL('/ranking', req.url))
  }

  return NextResponse.next()
})

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
