import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authOptions'
import { prisma } from '@/lib/prisma'

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json(
      { error: '请先登录后再发表评论。' },
      { status: 401 },
    )
  }

  const body = await req.json().catch(() => null)
  if (!body) {
    return NextResponse.json(
      { error: '请求数据格式错误。' },
      { status: 400 },
    )
  }

  const content = (body.content ?? '').toString().trim()
  const isAnonymous = !!body.isAnonymous
  const parentReplyId = body.parentReplyId
    ? body.parentReplyId.toString()
    : null

  if (!content) {
    return NextResponse.json(
      { error: '回复内容不能为空' },
      { status: 400 },
    )
  }

  // 检查是否被禁言
  const dbUser = await prisma.user.findUnique({
    where: { id: session.user.id as string },
    select: { isMuted: true },
  })

  if (dbUser?.isMuted) {
    return NextResponse.json(
      { error: '你已被管理员禁言，暂时无法发表评论。' },
      { status: 403 },
    )
  }

  const replierName = isAnonymous
    ? '匿名用户'
    : (session.user.nickname as string) ||
      (session.user.name as string) ||
      (session.user.email as string) ||
      '匿名用户'

  const questionId = params.id

  try {
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

    // 重新统计回复数量
    const repliesCount = await prisma.reply.count({
      where: { questionId },
    })
    await prisma.question.update({
      where: { id: questionId },
      data: { repliesCount },
    })

    const question = await prisma.question.findUnique({
      where: { id: questionId },
      include: {
        replies: {
          orderBy: { date: 'asc' },
          include: {
            children: {
              orderBy: { date: 'asc' },
            },
          },
        },
        likesRel: true,
      },
    })

    return NextResponse.json({ question })
  } catch (error) {
    console.error('[questions.reply] error:', error)
    return NextResponse.json(
      { error: '发表评论失败，请稍后重试。' },
      { status: 500 },
    )
  }
}


