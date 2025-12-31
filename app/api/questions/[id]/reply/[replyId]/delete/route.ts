import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authOptions'
import { prisma } from '@/lib/prisma'

export async function POST(
  _req: NextRequest,
  { params }: { params: { id: string; replyId: string } },
) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json(
      { error: '请先登录后再删除回复。' },
      { status: 401 },
    )
  }

  const replyId = params.replyId
  const questionId = params.id

  try {
    const reply = await prisma.reply.findUnique({
      where: { id: replyId },
      select: {
        replierId: true,
      },
    })

    if (!reply) {
      return NextResponse.json(
        { error: '回复不存在' },
        { status: 404 },
      )
    }

    const isAdmin = session.user.role === 'admin'
    if (!isAdmin && reply.replierId !== session.user.id) {
      return NextResponse.json(
        { error: '只能删除自己发布的回复' },
        { status: 403 },
      )
    }

    await prisma.reply.delete({
      where: { id: replyId },
    })

    // 重新统计回复数量
    const repliesCount = await prisma.reply.count({
      where: { questionId },
    })
    await prisma.question.update({
      where: { id: questionId },
      data: { repliesCount },
    })

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('[replies.delete] error:', error)
    return NextResponse.json(
      { error: '删除回复失败，请稍后重试。' },
      { status: 500 },
    )
  }
}


