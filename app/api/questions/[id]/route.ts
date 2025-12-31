import { NextRequest, NextResponse } from 'next/server'

// 确保这个路由是动态的，不在构建时执行
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } },
) {
  // 在构建时跳过执行
  if (process.env.NEXT_PHASE === 'phase-production-build') {
    return NextResponse.json({ error: 'Service unavailable during build' }, { status: 503 })
  }

  // 动态导入 Prisma，避免在构建时初始化
  const { prisma } = await import('@/lib/prisma')
  
  const { id } = params
  try {
    const question = await prisma.question.findUnique({
      where: { id },
      include: {
        university: true,
        major: true,
        asker: {
          select: {
            id: true,
            nickname: true,
            username: true,
            email: true,
            role: true,
            avatarUrl: true,
            graduationYear: true,
            major: true,
            universityId: true,
          },
        },
        replies: {
          orderBy: { date: 'asc' },
          include: {
            replier: {
              select: {
                id: true,
                nickname: true,
                username: true,
                email: true,
                role: true,
                avatarUrl: true,
              },
            },
            children: {
              orderBy: { date: 'asc' },
              include: {
                replier: {
                  select: {
                    id: true,
                    nickname: true,
                    username: true,
                    email: true,
                    role: true,
                    avatarUrl: true,
                  },
                },
              },
            },
          },
        },
        likesRel: true,
      },
    })

    if (!question) {
      return NextResponse.json({ error: '问题不存在' }, { status: 404 })
    }

    return NextResponse.json({ question })
  } catch (error) {
    console.error('[questions.detail] error:', error)
    return NextResponse.json(
      { error: '加载问题失败' },
      { status: 500 },
    )
  }
}


