import { getServerSession } from 'next-auth'
import { NextResponse } from 'next/server'
import { authOptions } from './authOptions'
import { prisma } from './prisma'

// JWT role hints are for navigation only; every privileged operation reads the current role.
export async function requireAdmin() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return { error: NextResponse.json({ error: '请先登录' }, { status: 401 }) } as const
  const user = await prisma.user.findUnique({ where: { id: session.user.id }, select: { id: true, role: true } })
  if (user?.role !== 'admin') return { error: NextResponse.json({ error: '仅管理员可以执行此操作' }, { status: 403 }) } as const
  return { user } as const
}
