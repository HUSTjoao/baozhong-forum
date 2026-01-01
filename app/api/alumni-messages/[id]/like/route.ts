import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authOptions'

export const dynamic = 'force-dynamic'

export async function POST(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  // 1. 构建阶段防护
  if (process.env.NEXT_PHASE === 'phase-production-build') {
    return NextResponse.json({ message: 'Bypass' }, { status: 200 });
  }

  try {
    const { prisma } = await import('@/lib/prisma')
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: '请登录' }, { status: 401 })
    }

    const messageId = params.id
    const userId = session.user.id

    // 2. 关键修改：使用正确的模型名 alumniMessageLike
    // 3. 关键修改：使用 schema 定义的复合唯一键名 messageId_userId
    const existingLike = await prisma.alumniMessageLike.findUnique({
      where: {
        messageId_userId: { messageId, userId }
      }
    })

    if (existingLike) {
      await prisma.alumniMessageLike.delete({
        where: { messageId_userId: { messageId, userId } }
      })
      return NextResponse.json({ liked: false })
    } else {
      await prisma.alumniMessageLike.create({
        data: { messageId, userId }
      })
      return NextResponse.json({ liked: true })
    }
  } catch (error) {
    console.error('[LIKE_API_ERROR]:', error)
    return NextResponse.json({ error: '操作失败' }, { status: 500 })
  }
}