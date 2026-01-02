import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authOptions'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  if (process.env.NEXT_PHASE === 'phase-production-build') {
    return NextResponse.json({ error: 'Building' }, { status: 503 })
  }

  const { prisma } = await import('@/lib/prisma')
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.id) {
    return NextResponse.json({ error: '请先登录后再发表评论。' }, { status: 401 })
  }

  const body = await req.json().catch(() => null)
  const content = (body?.content ?? '').toString().trim()
  const isAnonymous = !!body?.isAnonymous
  const parentReplyId = body?.parentReplyId?.toString() || null

  if (!content) {
    return NextResponse.json({ error: '回复内容不能为空' }, { status: 400 })
  }

  const questionId = params.id

  try {
    // 1. 检查用户状态
    const dbUser = await prisma.user.findUnique({
      where: { id: session.user.id as string },
      select: { isMuted: true, nickname: true, avatarUrl: true },
    })

    if (dbUser?.isMuted) {
      return NextResponse.json({ error: '你已被管理员禁言。' }, { status: 403 })
    }

    const replierName = isAnonymous ? '匿名用户' : (dbUser?.nickname || '校友')

    // 2. 创建回复
    await prisma.reply.create({
      data: {
        id: `r_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`,
        questionId,
        content,
        isAnonymous,
        replierName,
        replierId: isAnonymous ? null : (session.user.id as string),
        parentReplyId,
      },
    })

    // 3. 更新问题的回复统计
    const currentRepliesCount = await prisma.reply.count({ where: { questionId } })
    await prisma.question.update({
      where: { id: questionId },
      data: { repliesCount: currentRepliesCount },
    })

    // 4. 返回最新的“树状”回复结构，供前端刷新
    const updatedQuestion = await prisma.question.findUnique({
      where: { id: questionId },
      include: {
        replies: {
          where: { parentReplyId: null }, // 重点：只取顶级，子项在 children 里
          orderBy: { date: 'asc' },
          include: {
            replier: { select: { id: true, nickname: true, avatarUrl: true } },
            children: {
              orderBy: { date: 'asc' },
              include: {
                replier: { select: { id: true, nickname: true, avatarUrl: true } }
              },
            },
          },
        },
        likesRel: true,
      },
    })

    return NextResponse.json({ question: updatedQuestion })
  } catch (error) {
    console.error('[questions.reply] error:', error)
    return NextResponse.json({ error: '回复失败' }, { status: 500 })
  }
}