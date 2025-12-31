import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authOptions'
import { prisma } from '@/lib/prisma'

// 删除寄语
export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } },
) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json(
      { error: '请先登录后再删除寄语。' },
      { status: 401 },
    )
  }

  const messageId = params.id

  try {
    const message = await prisma.alumniMessage.findUnique({
      where: { id: messageId },
      select: {
        userId: true,
      },
    })

    if (!message) {
      return NextResponse.json(
        { error: '寄语不存在' },
        { status: 404 },
      )
    }

    const isAdmin = session.user.role === 'admin'

    if (!isAdmin && message.userId !== session.user.id) {
      return NextResponse.json(
        { error: '只能删除自己发布的寄语' },
        { status: 403 },
      )
    }

    // 删除寄语（级联删除点赞记录）
    await prisma.alumniMessage.delete({
      where: { id: messageId },
    })

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('[alumni-messages.delete] error:', error)
    return NextResponse.json(
      { error: '删除寄语失败，请稍后重试。' },
      { status: 500 },
    )
  }
}

