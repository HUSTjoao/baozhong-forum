import type { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import {
  getUserByUsernameOrEmail,
  verifyPassword,
  type User,
} from '@/data/users'

// 统一的 NextAuth 配置，供 API 路由和 getServerSession 复用
export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        username: { label: '账号', type: 'text' },
        password: { label: '密码', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          console.log('[NextAuth] Missing username or password')
          return null
        }

        try {
          const user = getUserByUsernameOrEmail(credentials.username.trim())

          if (!user) {
            console.log('[NextAuth] User not found:', credentials.username)
            return null
          }

          // 验证密码
          if (!verifyPassword(user, credentials.password)) {
            console.log('[NextAuth] Password mismatch for user:', credentials.username)
            return null
          }

          // 返回用户信息（不包含密码）
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            username: user.username,
            role: user.role,
            universityId: user.universityId,
            graduationYear: user.graduationYear,
            major: user.major,
            gender: user.gender,
            avatarUrl: user.avatarUrl,
            nickname: user.nickname,
            bio: user.bio,
            alumniMessage: user.alumniMessage,
          } as any
        } catch (error) {
          console.error('[NextAuth] Error in authorize:', error)
          return null
        }
      },
    }),
  ],
  pages: {
    signIn: '/auth/login',
    signOut: '/auth/login',
    error: '/auth/login',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = (user as any).id
        token.email = (user as any).email
        token.name = (user as any).name
        token.username = (user as any).username
        token.role = (user as any).role
        token.universityId = (user as any).universityId
        token.graduationYear = (user as any).graduationYear
        token.major = (user as any).major
        token.gender = (user as any).gender

        // 头像是 base64 时体积可能非常大，为避免 JWT Cookie 过大导致 431，
        // 只在长度较小（例如使用远程 URL）时才写入 token
        const avatarUrl = (user as any).avatarUrl
        if (typeof avatarUrl === 'string' && avatarUrl.length < 1024) {
          token.avatarUrl = avatarUrl
        } else {
          token.avatarUrl = undefined
        }

        token.nickname = (user as any).nickname
        token.bio = (user as any).bio
        token.alumniMessage = (user as any).alumniMessage
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        const u = session.user as any
        u.id = token.id as string
        u.email = token.email as string
        u.name = token.name as string
        u.username = token.username as string
        u.role = token.role as string
        u.universityId = token.universityId as string
        u.graduationYear = token.graduationYear as number | string
        u.major = token.major as string
        u.gender = token.gender as
          | 'male'
          | 'female'
          | 'prefer-not-to-say'
          | undefined
        u.avatarUrl = token.avatarUrl as string | undefined
        u.nickname = token.nickname as string
        u.bio = token.bio as string
        u.alumniMessage = token.alumniMessage as string
      }
      return session
    },
  },
  session: {
    strategy: 'jwt',
  },
  secret: process.env.NEXTAUTH_SECRET || 'your-secret-key-change-in-production',
}


