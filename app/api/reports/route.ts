import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authOptions'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const reports = await prisma.report.findMany({
      orderBy: { date: 'desc' },
    })
    return NextResponse.json({ reports })
  } catch (error) {
    console.error('[reports.list] error:', error)
    return NextResponse.json(
      { error: '加载举报列表失败' },
      { status: 500 },
    )
  }
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json(
      { error: '请先登录后再举报内容。' },
      { status: 401 },
    )
  }

  const body = await req.json().catch(() => null)
  if (!body) {
    return NextResponse.json(
      { error: '请求数据格式错误。' },
      { status: 400 },
    )
  }

  const { type, targetId, targetTitle, targetContent, questionId, reason } =
    body

  if (!type || !targetId || !targetContent || !questionId || !reason) {
    return NextResponse.json(
      { error: '举报信息不完整' },
      { status: 400 },
    )
  }

  try {
    await prisma.report.create({
      data: {
        id: `rep_${Date.now()}_${Math.random()
          .toString(36)
          .slice(2, 10)}`,
        type,
        targetId,
        targetTitle,
        targetContent,
        reason,
        reporterId: session.user.id as string,
        reporterName:
          (session.user.nickname as string) ||
          (session.user.name as string) ||
          (session.user.email as string) ||
          '匿名用户',
        questionId,
      },
    })

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('[reports.create] error:', error)
    return NextResponse.json(
      { error: '提交举报失败，请稍后重试。' },
      { status: 500 },
    )
  }
}


