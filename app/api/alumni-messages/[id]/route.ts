import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authOptions'

// 确保这个路由是动态的，不在构建时执行
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

// 删除寄语
export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } },
) {
  // 在构建时跳过执行
  if (process.env.NEXT_PHASE === 'phase-production-build') {
    return NextResponse.json({ error: 'Service unavailable during build' }, { status: 503 })
  }

  // 动态导入 Prisma，避免在构建时初始化
  const { prisma } = await import('@/lib/prisma')
  
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

