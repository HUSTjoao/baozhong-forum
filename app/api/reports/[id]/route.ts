import { requireAdmin } from '@/lib/admin-access'
import { NextRequest, NextResponse } from 'next/server'

// 确保这个路由是动态的，不在构建时执行
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function PATCH(
  req: NextRequest,
  { params: routeParams }: { params: Promise<{ id: string }> },
) {
  const params = await routeParams
  // 在构建时跳过执行
  if (process.env.NEXT_PHASE === 'phase-production-build') {
    return NextResponse.json({ error: 'Service unavailable during build' }, { status: 503 })
  }

  // 动态导入 Prisma，避免在构建时初始化
  const { prisma } = await import('@/lib/prisma')
  
  const access = await requireAdmin()
  if (access.error) return access.error

  const body = await req.json().catch(() => null)
  if (!body) {
    return NextResponse.json(
      { error: '请求数据格式错误' },
      { status: 400 },
    )
  }

  const status = body.status as 'resolved' | 'ignored'
  if (!['resolved', 'ignored'].includes(status)) {
    return NextResponse.json(
      { error: '缺少状态参数' },
      { status: 400 },
    )
  }

  try {
    const result = await prisma.report.updateMany({ where: { id: params.id, status: 'pending' }, data: { status } })
    if (!result.count) return NextResponse.json({ error: '举报已处理或不存在，请刷新列表' }, { status: 409 })

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('[reports.update] error:', error)
    return NextResponse.json(
      { error: '更新举报状态失败' },
      { status: 500 },
    )
  }
}


