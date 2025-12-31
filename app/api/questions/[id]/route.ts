import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } },
) {
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


