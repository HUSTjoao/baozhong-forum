import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authOptions'

// 确保这个路由是动态的，不在构建时执行
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function POST(
  _req: NextRequest,
  { params }: { params: { id: string } },
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

  const questionId = params.id
  const userId = session.user.id as string

  try {
    const existing = await prisma.questionLike.findUnique({
      where: {
        questionId_userId: { questionId, userId },
      },
    })

    if (existing) {
      // 取消点赞
      await prisma.$transaction([
        prisma.questionLike.delete({
          where: { id: existing.id },
        }),
        prisma.question.update({
          where: { id: questionId },
          data: {
            likes: {
              decrement: 1,
            },
          },
        }),
      ])
    } else {
      // 点赞
      await prisma.$transaction([
        prisma.questionLike.create({
          data: {
            questionId,
            userId,
          },
        }),
        prisma.question.update({
          where: { id: questionId },
          data: {
            likes: {
              increment: 1,
            },
          },
        }),
      ])
    }

    const updated = await prisma.question.findUnique({
      where: { id: questionId },
      include: {
        likesRel: true,
      },
    })

    return NextResponse.json({ question: updated })
  } catch (error) {
    console.error('[questions.like] error:', error)
    return NextResponse.json(
      { error: '点赞失败，请稍后重试。' },
      { status: 500 },
    )
  }
}


