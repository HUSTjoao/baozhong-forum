import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authOptions'

export const dynamic = 'force-dynamic'

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } },
) {
  // 1. 拦截构建阶段，防止数据库连接失败导致构建中断
  if (process.env.NEXT_PHASE === 'phase-production-build') {
    return NextResponse.json({ message: 'Bypass' }, { status: 200 });
  }

  try {
    const { prisma } = await import('@/lib/prisma')
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: '请先登录' }, { status: 401 })
    }

    const messageId = params.id

    const message = await prisma.alumniMessage.findUnique({
      where: { id: messageId },
      select: { userId: true },
    })

    if (!message) {
      return NextResponse.json({ error: '寄语不存在' }, { status: 404 })
    }

    const isAdmin = session.user.role === 'admin'
    if (!isAdmin && message.userId !== session.user.id) {
      return NextResponse.json({ error: '无权删除' }, { status: 403 })
    }

    await prisma.alumniMessage.delete({
      where: { id: messageId },
    })

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('[DELETE_API_ERROR]:', error)
    return NextResponse.json({ error: '删除失败' }, { status: 500 })
  }
}