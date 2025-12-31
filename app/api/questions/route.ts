import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authOptions'

// 确保这个路由是动态的，不在构建时执行
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

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
      { error: '请先登录后再发布内容。' },
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

  const title = (body.title ?? '').toString().trim()
  const content = (body.content ?? '').toString().trim()
  const isAnonymous = !!body.isAnonymous
  const universityId = (body.universityId ?? '').toString() || null
  const majorId = body.majorId ? body.majorId.toString() : null
  const category = body.category ? body.category.toString() : null

  if (!title || !content) {
    return NextResponse.json(
      { error: '请填写完整的标题和内容。' },
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
      { error: '你已被管理员禁言，暂时无法发布内容。' },
      { status: 403 },
    )
  }

  const askerName = isAnonymous
    ? '匿名用户'
    : (session.user.nickname as string) ||
      (session.user.name as string) ||
      (session.user.email as string) ||
      '匿名用户'

  try {
    const created = await prisma.question.create({
      data: {
        id: `q_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`,
        title,
        content,
        askerName,
        isAnonymous,
        universityId: universityId || null,
        majorId,
        category,
        askerId: isAnonymous ? null : (session.user.id as string),
      },
    })

    return NextResponse.json({ question: created }, { status: 201 })
  } catch (error) {
    console.error('[questions.create] error:', error)
    return NextResponse.json(
      { error: '发布问题失败，请稍后重试。' },
      { status: 500 },
    )
  }
}

