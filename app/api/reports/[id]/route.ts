import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authOptions'

// 确保这个路由是动态的，不在构建时执行
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  // 在构建时跳过执行
  if (process.env.NEXT_PHASE === 'phase-production-build') {
    return NextResponse.json({ error: 'Service unavailable during build' }, { status: 503 })
  }

  // 动态导入 Prisma，避免在构建时初始化
  const { prisma } = await import('@/lib/prisma')
  
  const session = await getServerSession(authOptions)
  if (session?.user?.role !== 'admin') {
    return NextResponse.json(
      { error: '只有管理员可以处理举报' },
      { status: 403 },
    )
  }

  const body = await req.json().catch(() => null)
  if (!body) {
    return NextResponse.json(
      { error: '请求数据格式错误' },
      { status: 400 },
    )
  }

  const status = body.status as 'resolved' | 'ignored'
  if (!status) {
    return NextResponse.json(
      { error: '缺少状态参数' },
      { status: 400 },
    )
  }

  try {
    await prisma.report.update({
      where: { id: params.id },
      data: { status },
    })

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('[reports.update] error:', error)
    return NextResponse.json(
      { error: '更新举报状态失败' },
      { status: 500 },
    )
  }
}


