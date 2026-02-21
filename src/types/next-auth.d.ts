import type { DefaultSession } from 'next-auth'

declare module 'next-auth' {
  interface Session {
    user: {
      role?: 'racer' | 'admin'
    } & DefaultSession['user']
  }

  interface User {
    role?: 'racer' | 'admin'
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    role?: 'racer' | 'admin'
  }
}
