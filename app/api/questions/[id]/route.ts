import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } },
) {
  if (process.env.NEXT_PHASE === 'phase-production-build') {
    return NextResponse.json({ error: 'Building...' }, { status: 503 })
  }

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
            avatarUrl: true,
            role: true,
          },
        },
        // 核心修改：通过 filtering 确保第一层只显示顶级评论
        replies: {
          where: {
            parentReplyId: null // 重点：只找直接回复帖子的，不找回复别人的
          },
          orderBy: { date: 'asc' },
          include: {
            replier: {
              select: { id: true, nickname: true, avatarUrl: true }
            },
            // 嵌套查询子回复（楼中楼）
            children: {
              orderBy: { date: 'asc' },
              include: {
                replier: {
                  select: { id: true, nickname: true, avatarUrl: true }
                }
              }
            },
            likesRel: true // 加载评论的点赞信息
          }
        },
        likesRel: true, // 加载帖子的点赞信息
      },
    })

    if (!question) {
      return NextResponse.json({ error: '帖子已在数据库中消失' }, { status: 404 })
    }

    return NextResponse.json({ question })
  } catch (error) {
    console.error('[questions.detail] error:', error)
    return NextResponse.json({ error: '无法从数据库获取详情' }, { status: 500 })
  }
}