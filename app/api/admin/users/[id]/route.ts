import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin-access'
import { prisma } from '@/lib/prisma'
export const dynamic = 'force-dynamic'
export async function PATCH(req: NextRequest, { params: routeParams }: { params: Promise<{ id: string }> }) {
  const params = await routeParams
  try {
    const access = await requireAdmin()
    if (access.error) return access.error
    const body = await req.json().catch(() => null)
    if (typeof body?.isMuted !== 'boolean') return NextResponse.json({ error: '禁言状态格式不正确' }, { status: 400 })
    // Do not allow accidental lockout or a client request to alter roles.
    const result = await prisma.user.updateMany({ where: { id: params.id, OR: [{ role: null }, { role: { not: 'admin' } }] }, data: { isMuted: body.isMuted } })
    if (!result.count) {
      const user = await prisma.user.findUnique({ where: { id: params.id }, select: { role: true } })
      return NextResponse.json({ error: user ? '管理员账号不能被禁言' : '用户不存在' }, { status: user ? 403 : 404 })
    }
    return NextResponse.json({ ok: true })
  } catch { return NextResponse.json({ error: '更新用户状态失败' }, { status: 500 }) }
}
