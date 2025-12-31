import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
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
                name: true,
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
                    name: true,
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


