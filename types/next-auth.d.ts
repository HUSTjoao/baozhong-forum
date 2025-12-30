import 'next-auth'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      email: string
      name: string
      role?: string
      universityId?: string
      graduationYear?: number | string
      major?: string
      gender?: 'male' | 'female' | 'other'
      avatarUrl?: string
      nickname?: string
      bio?: string
      alumniMessage?: string
    }
  }

  interface User {
    id: string
    email: string
    name: string
    role?: string
    universityId?: string
    graduationYear?: number | string
    major?: string
    gender?: 'male' | 'female' | 'other'
    avatarUrl?: string
    nickname?: string
    bio?: string
    alumniMessage?: string
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string
    role?: string
    universityId?: string
    graduationYear?: number | string
    major?: string
    gender?: 'male' | 'female' | 'other'
    avatarUrl?: string
    nickname?: string
    bio?: string
    alumniMessage?: string
  }
}


