import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import type { UserRole, ShiftType } from './types'

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const email = (credentials.email as string).toLowerCase().trim()
        const password = credentials.password as string

        const user = await prisma.user.findUnique({
          where: { email },
        })

        if (!user) {
          return null
        }

        const isPasswordValid = await bcrypt.compare(password, user.password)
        if (!isPasswordValid) {
          return null
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.avatar,
          role: user.role as UserRole,
          isNew: user.isNew,
          shiftType: user.shiftType as ShiftType | undefined,
        }
      },
    }),
  ],
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/login',
  },
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      // Initial sign in — copy user fields to token
      if (user) {
        token.id = user.id as string
        token.role = user.role as UserRole
        token.isNew = user.isNew
        token.shiftType = user.shiftType
      }

      // Allow session updates (e.g. markOnboardingComplete)
      if (trigger === 'update' && session) {
        if (session.isNew !== undefined) {
          token.isNew = session.isNew
        }
        if (session.shiftType !== undefined) {
          token.shiftType = session.shiftType
        }
      }

      return token
    },
    async session({ session, token }) {
      session.user.id = token.id
      session.user.role = token.role
      session.user.isNew = token.isNew
      session.user.shiftType = token.shiftType
      return session
    },
  },
})
