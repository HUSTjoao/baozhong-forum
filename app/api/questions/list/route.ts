import { NextResponse } from 'next/server'

// 确保这个路由是动态的，不在构建时执行
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET() {
  // 在构建时跳过执行
  if (process.env.NEXT_PHASE === 'phase-production-build') {
    return NextResponse.json({ questions: [] })
  }

  // 动态导入 Prisma，避免在构建时初始化
  const { prisma } = await import('@/lib/prisma')
  
  try {
    const questions = await prisma.question.findMany({
      orderBy: { date: 'desc' },
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

    return NextResponse.json({ questions })
  } catch (error) {
    console.error('[questions.list] error:', error)
    return NextResponse.json(
      { error: '加载问题列表失败' },
      { status: 500 },
    )
  }
}


