import type { DefaultSession } from 'next-auth'

declare module 'next-auth' {
  interface Session {
    user: {
      role?: 'racer' | 'admin'
      driverId?: string
    } & DefaultSession['user']
  }

  interface User {
    role?: 'racer' | 'admin'
    driverId?: string
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    role?: 'racer' | 'admin'
    driverId?: string
  }
}
