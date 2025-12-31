import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authOptions'

// 确保这个路由是动态的，不在构建时执行
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function POST(
  _req: NextRequest,
  { params }: { params: { id: string; replyId: string } },
) {
  // 在构建时跳过执行
  if (process.env.NEXT_PHASE === 'phase-production-build') {
    return NextResponse.json({ error: 'Service unavailable during build' }, { status: 503 })
  }

  // 动态导入 Prisma，避免在构建时初始化
  const { prisma } = await import('@/lib/prisma')
  
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json(
      { error: '请先登录后再点赞。' },
      { status: 401 },
    )
  }

  const replyId = params.replyId
  const userId = session.user.id as string

  try {
    const existing = await prisma.replyLike.findUnique({
      where: {
        replyId_userId: { replyId, userId },
      },
    })

    if (existing) {
      await prisma.$transaction([
        prisma.replyLike.delete({
          where: { id: existing.id },
        }),
        prisma.reply.update({
          where: { id: replyId },
          data: {
            likes: {
              decrement: 1,
            },
          },
        }),
      ])
    } else {
      await prisma.$transaction([
        prisma.replyLike.create({
          data: {
            replyId,
            userId,
          },
        }),
        prisma.reply.update({
          where: { id: replyId },
          data: {
            likes: {
              increment: 1,
            },
          },
        }),
      ])
    }

    const reply = await prisma.reply.findUnique({
      where: { id: replyId },
      include: {
        likesRel: true,
      },
    })

    return NextResponse.json({ reply })
  } catch (error) {
    console.error('[replies.like] error:', error)
    return NextResponse.json(
      { error: '点赞失败，请稍后重试。' },
      { status: 500 },
    )
  }
}


