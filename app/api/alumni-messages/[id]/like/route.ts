import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authOptions'
import { prisma } from '@/lib/prisma'

// 点赞/取消点赞寄语
export async function POST(
  _req: NextRequest,
  { params }: { params: { id: string } },
) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json(
      { error: '请先登录后再点赞。' },
      { status: 401 },
    )
  }

  const messageId = params.id
  const userId = session.user.id as string

  // 检查是否被禁言
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { isMuted: true },
  })

  if (user?.isMuted) {
    return NextResponse.json(
      { error: '你已被管理员禁言，暂时无法点赞。' },
      { status: 403 },
    )
  }

  try {
    const existing = await prisma.alumniMessageLike.findUnique({
      where: {
        messageId_userId: { messageId, userId },
      },
    })

    if (existing) {
      // 取消点赞
      await prisma.$transaction([
        prisma.alumniMessageLike.delete({
          where: { id: existing.id },
        }),
        prisma.alumniMessage.update({
          where: { id: messageId },
          data: {
            likes: {
              decrement: 1,
            },
          },
        }),
      ])
    } else {
      // 点赞
      await prisma.$transaction([
        prisma.alumniMessageLike.create({
          data: {
            messageId,
            userId,
          },
        }),
        prisma.alumniMessage.update({
          where: { id: messageId },
          data: {
            likes: {
              increment: 1,
            },
          },
        }),
      ])
    }

    const updated = await prisma.alumniMessage.findUnique({
      where: { id: messageId },
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
    })

    return NextResponse.json({ message: updated })
  } catch (error) {
    console.error('[alumni-messages.like] error:', error)
    return NextResponse.json(
      { error: '点赞失败，请稍后重试。' },
      { status: 500 },
    )
  }
}

