import { requireAdmin } from '@/lib/admin-access'
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authOptions'

// 确保这个路由是动态的，不在构建时执行
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET() {
  const access = await requireAdmin()
  if (access.error) return access.error
  // 在构建时跳过执行
  if (process.env.NEXT_PHASE === 'phase-production-build') {
    return NextResponse.json({ reports: [] })
  }

  // 动态导入 Prisma，避免在构建时初始化
  const { prisma } = await import('@/lib/prisma')
  
  try {
    const reports = await prisma.report.findMany({
      orderBy: { date: 'desc' },
    })
    return NextResponse.json({ reports })
  } catch (error) {
    console.error('[reports.list] error:', error)
    return NextResponse.json(
      { error: '加载举报列表失败' },
      { status: 500 },
    )
  }
}

export async function POST(req: NextRequest) {
  // 在构建时跳过执行
  if (process.env.NEXT_PHASE === 'phase-production-build') {
    return NextResponse.json({ error: 'Service unavailable during build' }, { status: 503 })
  }

  // 动态导入 Prisma，避免在构建时初始化
  const { prisma } = await import('@/lib/prisma')
  
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json(
      { error: '请先登录后再举报内容。' },
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

  const { type, targetId, questionId, reason } =
    body

  if (!['question', 'reply'].includes(type) || typeof targetId !== 'string' || targetId.length > 200 || typeof questionId !== 'string' || questionId.length > 200 || typeof reason !== 'string' || !reason.trim() || reason.length > 1000) {
    return NextResponse.json(
      { error: '举报信息不完整' },
      { status: 400 },
    )
  }

  try {
    const reporter = await prisma.user.findUnique({ where: { id: session.user.id }, select: { nickname: true, username: true, isMuted: true } })
    if (!reporter || reporter.isMuted) return NextResponse.json({ error: '当前账号暂时无法提交举报' }, { status: 403 })
    const question = await prisma.question.findUnique({ where: { id: questionId }, select: { title: true, content: true } })
    if (!question) return NextResponse.json({ error: '讨论不存在' }, { status: 404 })
    const reply = type === 'reply' ? await prisma.reply.findFirst({ where: { id: targetId, questionId }, select: { content: true } }) : null
    if ((type === 'question' && targetId !== questionId) || (type === 'reply' && !reply)) return NextResponse.json({ error: '被举报内容不存在或不属于此讨论' }, { status: 400 })
    const duplicate = await prisma.report.findFirst({ where: { reporterId: session.user.id, targetId, type, status: 'pending' }, select: { id: true } })
    if (duplicate) return NextResponse.json({ error: '你已举报过这条内容，请等待处理' }, { status: 409 })
    await prisma.report.create({
      data: {
        id: `rep_${Date.now()}_${Math.random()
          .toString(36)
          .slice(2, 10)}`,
        type,
        targetId,
        targetTitle: question.title,
        targetContent: reply?.content || question.content,
        reason: reason.trim(),
        reporterId: session.user.id as string,
        reporterName: reporter.nickname || reporter.username || '用户',
        questionId,
      },
    })

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('[reports.create] error:', error)
    return NextResponse.json(
      { error: '提交举报失败，请稍后重试。' },
      { status: 500 },
    )
  }
}


