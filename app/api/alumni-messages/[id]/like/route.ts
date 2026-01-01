import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authOptions'

export const dynamic = 'force-dynamic'

export async function POST(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // 切换点赞状态逻辑
    const existingLike = await prisma.like.findUnique({
      where: {
        userId_messageId: { userId, messageId }
      }
    })

    if (existingLike) {
      await prisma.like.delete({
        where: { userId_messageId: { userId, messageId } }
      })
      return NextResponse.json({ liked: false })
    } else {
      await prisma.like.create({
        data: { userId, messageId }
      })
      return NextResponse.json({ liked: true })
    }
  } catch (error) {
    console.error('[LIKE_API_ERROR]:', error)
    return NextResponse.json({ error: '操作失败' }, { status: 500 })
  }
}