import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin-access'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'
export async function GET(req: NextRequest) {
  try {
    const access = await requireAdmin()
    if (access.error) return access.error
    const kind = req.nextUrl.searchParams.get('kind') || 'users'
    const q = (req.nextUrl.searchParams.get('q') || '').trim().slice(0, 120)
    const page = Math.max(1, Math.min(100000, Number(req.nextUrl.searchParams.get('page')) || 1)) | 0
    const take = 30, skip = (page - 1) * take
    const status = req.nextUrl.searchParams.get('status')
    const stats = {
      users: await prisma.user.count(), questions: await prisma.question.count(),
      replies: await prisma.reply.count(), messages: await prisma.alumniMessage.count(),
      reports: await prisma.report.count({ where: { status: 'pending' } }),
    }
    let rows: unknown[], total: number
    if (kind === 'users') {
      const where = q ? { OR: [{ username: { contains: q } }, { nickname: { contains: q } }, { email: { contains: q } }] } : {}
      total = await prisma.user.count({ where })
      rows = await prisma.user.findMany({ where, skip, take, orderBy: [{ createdAt: 'desc' }, { id: 'desc' }], select: { id: true, username: true, nickname: true, email: true, role: true, isMuted: true, createdAt: true, _count: { select: { questions: true, replies: true, alumniMessages: true } } } })
    } else if (kind === 'questions') {
      const where = q ? { OR: [{ title: { contains: q } }, { content: { contains: q } }] } : {}
      total = await prisma.question.count({ where })
      rows = await prisma.question.findMany({ where, skip, take, orderBy: [{ date: 'desc' }, { id: 'desc' }], select: { id: true, title: true, content: true, date: true, askerName: true, isAnonymous: true, repliesCount: true } })
    } else if (kind === 'replies') {
      const where = q ? { content: { contains: q } } : {}
      total = await prisma.reply.count({ where })
      rows = await prisma.reply.findMany({ where, skip, take, orderBy: [{ date: 'desc' }, { id: 'desc' }], select: { id: true, content: true, date: true, replierName: true, isAnonymous: true, questionId: true, parentReplyId: true, question: { select: { title: true } } } })
    } else if (kind === 'messages') {
      const where = q ? { content: { contains: q } } : {}
      total = await prisma.alumniMessage.count({ where })
      rows = await prisma.alumniMessage.findMany({ where, skip, take, orderBy: [{ createdAt: 'desc' }, { id: 'desc' }], select: { id: true, content: true, createdAt: true, user: { select: { nickname: true, username: true } } } })
    } else if (kind === 'reports') {
      const where = { ...(status && ['pending', 'resolved', 'ignored'].includes(status) ? { status } : {}), ...(q ? { OR: [{ reason: { contains: q } }, { targetContent: { contains: q } }, { targetTitle: { contains: q } }] } : {}) }
      total = await prisma.report.count({ where })
      rows = await prisma.report.findMany({ where, skip, take, orderBy: [{ date: 'desc' }, { id: 'desc' }] })
    } else return NextResponse.json({ error: '不支持的管理栏目' }, { status: 400 })
    return NextResponse.json({ rows, total, page, stats, adminId: access.user.id }, { headers: { 'Cache-Control': 'no-store' } })
  } catch {
    return NextResponse.json({ error: '管理数据暂时无法加载，请重试' }, { status: 500 })
  }
}
