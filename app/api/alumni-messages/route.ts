import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authOptions'

// 确保这个路由是动态的，不在构建时执行
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

// 获取所有学长学姐寄语
export async function GET() {
  // 在构建时跳过执行
  if (process.env.NEXT_PHASE === 'phase-production-build') {
    return NextResponse.json({ messages: [] })
  }

  // 动态导入 Prisma，避免在构建时初始化
  const { prisma } = await import('@/lib/prisma')
  
  try {
    const messages = await prisma.alumniMessage.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            nickname: true,
            username: true,
            email: true,
            role: true,
            avatarUrl: true,
            universityId: true,
            graduationYear: true,
            major: true,
          },
        },
        likesRel: {
          select: {
            userId: true,
          },
        },
      },
      where: {
        isApproved: true,
      },
    })

    return NextResponse.json({ messages })
  } catch (error) {
    console.error('[alumni-messages.list] error:', error)
    return NextResponse.json(
      { error: '加载寄语列表失败' },
      { status: 500 },
    )
  }
}

// 创建新寄语
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
      { error: '请先登录后再发布寄语。' },
      { status: 401 },
    )
  }

  // 检查用户角色是否为学长学姐
  const user = await prisma.user.findUnique({
    where: { id: session.user.id as string },
    select: { 
      role: true, 
      isMuted: true,
      graduationYear: true,
    },
  })

  if (!user) {
    return NextResponse.json(
      { error: '用户不存在' },
      { status: 404 },
    )
  }

  if (user.isMuted) {
    return NextResponse.json(
      { error: '你已被管理员禁言，暂时无法发布内容。' },
      { status: 403 },
    )
  }

  // 判断是否为学长学姐
  const isAlumni = user.role === 'alumni' || 
    (typeof user.graduationYear === 'number' && user.graduationYear <= new Date().getFullYear())

  if (!isAlumni && !['gaoyi', 'gaoer', 'gaosan'].includes(user.graduationYear as string)) {
    return NextResponse.json(
      { error: '仅学长学姐可以发布寄语' },
      { status: 403 },
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

  if (!content) {
    return NextResponse.json(
      { error: '寄语内容不能为空' },
      { status: 400 },
    )
  }

  if (content.length > 500) {
    return NextResponse.json(
      { error: '寄语内容不能超过500字' },
      { status: 400 },
    )
  }

  try {
    const message = await prisma.alumniMessage.create({
      data: {
        id: `msg_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`,
        userId: session.user.id as string,
        content,
      },
      include: {
        user: {
          select: {
            id: true,
            nickname: true,
            username: true,
            email: true,
            role: true,
            avatarUrl: true,
            universityId: true,
            graduationYear: true,
            major: true,
          },
        },
        likesRel: true,
      },
    })

    return NextResponse.json({ message }, { status: 201 })
  } catch (error) {
    console.error('[alumni-messages.create] error:', error)
    return NextResponse.json(
      { error: '发布寄语失败，请稍后重试。' },
      { status: 500 },
    )
  }
}

