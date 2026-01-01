import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authOptions'

// 1. 强制设为动态，防止构建时尝试连接数据库
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

// 获取所有学长学姐寄语
export async function GET() {
  // 2. 构建阶段拦截
  if (process.env.NEXT_PHASE === 'phase-production-build') {
    return NextResponse.json({ messages: [] })
  }

  try {
    const { prisma } = await import('@/lib/prisma')
    
    const messages = await prisma.alumniMessage.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            nickname: true,
            username: true,
            avatarUrl: true,
            universityId: true,
            graduationYear: true,
            major: true,
          },
        },
        likesRel: {
          select: { userId: true },
        },
      },
      where: {
        isApproved: true,
      },
    })

    return NextResponse.json({ messages })
  } catch (error) {
    console.error('[alumni-messages.list] error:', error)
    return NextResponse.json({ error: '加载失败' }, { status: 500 })
  }
}

// 创建新寄语
export async function POST(req: NextRequest) {
  if (process.env.NEXT_PHASE === 'phase-production-build') {
    return NextResponse.json({ message: 'Bypass' }, { status: 200 })
  }

  try {
    const { prisma } = await import('@/lib/prisma')
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: '请先登录' }, { status: 401 })
    }

    // 检查用户状态
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true, isMuted: true, graduationYear: true },
    })

    if (!user || user.isMuted) {
      return NextResponse.json({ error: '无权发布或已被禁言' }, { status: 403 })
    }

    const body = await req.json().catch(() => null)
    if (!body?.content?.trim()) {
      return NextResponse.json({ error: '内容不能为空' }, { status: 400 })
    }

    const message = await prisma.alumniMessage.create({
      data: {
        id: `msg_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`,
        userId: session.user.id,
        content: body.content.trim(),
      },
      include: {
        user: true,
        likesRel: true,
      }
    })

    return NextResponse.json({ message }, { status: 201 })
  } catch (error) {
    console.error('[alumni-messages.create] error:', error)
    return NextResponse.json({ error: '发布失败' }, { status: 500 })
  }
}