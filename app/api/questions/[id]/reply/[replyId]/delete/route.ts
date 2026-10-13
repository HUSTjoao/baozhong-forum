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
      { error: '请先登录后再删除回复。' },
      { status: 401 },
    )
  }

  const replyId = params.replyId
  const questionId = params.id

  try {
    const reply = await prisma.reply.findUnique({
      where: { id: replyId },
      select: {
        replierId: true,
        questionId: true,
      },
    })

    if (!reply || reply.questionId !== questionId) {
      return NextResponse.json(
        { error: '回复不存在' },
        { status: 404 },
      )
    }

    const actor = await prisma.user.findUnique({ where: { id: session.user.id }, select: { role: true } })
    const isAdmin = actor?.role === 'admin'
    if (!isAdmin && reply.replierId !== session.user.id) {
      return NextResponse.json(
        { error: '只能删除自己发布的回复' },
        { status: 403 },
      )
    }

    await prisma.$transaction(async tx => {
      const replies = await tx.reply.findMany({ where: { questionId }, select: { id: true, parentReplyId: true } })
      const descendants: string[] = [], seen = new Set<string>()
      const visit = (id: string) => {
        if (seen.has(id)) return
        seen.add(id); descendants.push(id)
        replies.filter(item => item.parentReplyId === id).forEach(item => visit(item.id))
      }
      visit(replyId)
      await tx.replyLike.deleteMany({ where: { replyId: { in: descendants } } })
      for (const id of descendants.reverse()) await tx.reply.delete({ where: { id } })
      const repliesCount = await tx.reply.count({ where: { questionId } })
      await tx.question.update({ where: { id: questionId }, data: { repliesCount } })
    })

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('[replies.delete] error:', error)
    return NextResponse.json(
      { error: '删除回复失败，请稍后重试。' },
      { status: 500 },
    )
  }
}


