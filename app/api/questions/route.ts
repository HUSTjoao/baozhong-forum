import { NextResponse } from 'next/server'
import { randomUUID } from 'node:crypto'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authOptions'
export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) return NextResponse.json({ error: '请先登录' }, { status: 401 })
    const user = await prisma.user.findUnique({ where: { id: session.user.id }, select: { id: true, nickname: true, username: true, isMuted: true } })
    if (!user) return NextResponse.json({ error: '账号不存在，请重新登录' }, { status: 401 })
    if (user.isMuted) return NextResponse.json({ error: '当前账号暂时无法发帖' }, { status: 403 })
    let data
    try { data = await req.json() } catch { return NextResponse.json({ error: '请求格式不正确' }, { status: 400 }) }
    if (!data || typeof data !== 'object') return NextResponse.json({ error: '请求格式不正确' }, { status: 400 })
    const title = typeof data.title === 'string' ? data.title.trim() : ''
    const content = typeof data.content === 'string' ? data.content.trim() : ''
    if (title.length < 2 || title.length > 100 || !content || content.length > 5000) return NextResponse.json({ error: '标题需为 2–100 字，正文需为 1–5000 字' }, { status: 400 })
    if ((data.universityId != null && typeof data.universityId !== 'string') || (data.majorId != null && typeof data.majorId !== 'string') || (data.isAnonymous != null && typeof data.isAnonymous !== 'boolean')) return NextResponse.json({ error: '字段格式不正确' }, { status: 400 })
    const universityId = data.universityId || null
    const majorId = data.majorId || null
    if (universityId && !await prisma.universityProfile.findUnique({ where: { id: universityId }, select: { id: true } })) return NextResponse.json({ error: '该大学尚未开放讨论' }, { status: 404 })
    if (majorId && !await prisma.major.findUnique({ where: { id: majorId }, select: { id: true } })) return NextResponse.json({ error: '专业不存在' }, { status: 404 })
    const question = await prisma.question.create({ data: { id: randomUUID(), title, content, universityId, majorId, askerId: user.id, askerName: user.nickname || user.username || '同学', isAnonymous: data.isAnonymous === true, category: typeof data.category === 'string' ? data.category.slice(0, 40) : null }, select: { id: true, title: true, content: true, universityId: true, majorId: true, date: true, isAnonymous: true, likes: true, repliesCount: true } })
    return NextResponse.json({ question }, { status: 201 })
  } catch (error) {
    console.error('Question create failed', error)
    return NextResponse.json({ error: '发布失败，请稍后重试' }, { status: 500 })
  }
}
export async function GET(req: Request) {
  try {
    const universityId = new URL(req.url).searchParams.get('universityId')
    const questions = await prisma.question.findMany({ where: universityId ? { universityId } : {}, orderBy: { date: 'desc' }, take: 50, select: { id: true, title: true, content: true, universityId: true, majorId: true, date: true, isAnonymous: true, askerName: true, likes: true, repliesCount: true } })
    return NextResponse.json(questions.map(q => ({ ...q, askerName: q.isAnonymous ? '匿名同学' : q.askerName })))
  } catch { return NextResponse.json({ error: '加载讨论失败，请稍后重试' }, { status: 500 }) }
}
