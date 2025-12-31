import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authOptions'
import { prisma } from '@/lib/prisma'

export async function POST(
  _req: NextRequest,
  { params }: { params: { id: string } },
) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json(
      { error: '请先登录后再删除问题。' },
      { status: 401 },
    )
  }

  const questionId = params.id

  try {
    const question = await prisma.question.findUnique({
      where: { id: questionId },
      select: {
        askerId: true,
      },
    })

    if (!question) {
      return NextResponse.json(
        { error: '问题不存在' },
        { status: 404 },
      )
    }

    const isAdmin = session.user.role === 'admin'

    if (!isAdmin && question.askerId !== session.user.id) {
      return NextResponse.json(
        { error: '只能删除自己发布的问题' },
        { status: 403 },
      )
    }

    // 外键采用级联删除或手动删除关联的回复、点赞
    await prisma.question.delete({
      where: { id: questionId },
    })

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('[questions.delete] error:', error)
    return NextResponse.json(
      { error: '删除问题失败，请稍后重试。' },
      { status: 500 },
    )
  }
}


