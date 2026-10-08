import { NextResponse } from 'next/server'
import { randomUUID } from 'node:crypto'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authOptions'
import { prisma } from '@/lib/prisma'
import { getCampusComments } from '@/lib/campus-comments'
export const dynamic = 'force-dynamic'
export async function GET(req: Request, { params }: { params: { id: string } }) {
  if (!await prisma.universityProfile.findUnique({ where: { id: params.id }, select: { id: true } })) return NextResponse.json({ error: '学校不存在' }, { status: 404 })
  const cursor = new URL(req.url).searchParams.get('cursor') || undefined
  if (cursor && !await prisma.question.findFirst({ where: { id: cursor, universityId: params.id }, select: { id: true } })) return NextResponse.json({ error: '评论不存在' }, { status: 404 })
  return NextResponse.json(await getCampusComments(params.id, cursor))
}
export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) return NextResponse.json({ error: '登录后就可以发言了' }, { status: 401 })
    const user = await prisma.user.findUnique({ where: { id: session.user.id }, select: { id: true, nickname: true, username: true, isMuted: true } })
    if (!user) return NextResponse.json({ error: '请重新登录' }, { status: 401 })
    if (user.isMuted) return NextResponse.json({ error: '当前账号暂时无法发言' }, { status: 403 })
    const body = await req.json().catch(() => null)
    if (!body || typeof body.content !== 'string' || (body.isAnonymous != null && typeof body.isAnonymous !== 'boolean') || (body.replyTo != null && typeof body.replyTo !== 'string')) return NextResponse.json({ error: '内容格式不正确' }, { status: 400 })
    const content = body.content.trim()
    if (!content || content.length > 3000) return NextResponse.json({ error: '写下 1–3000 字再发送吧' }, { status: 400 })
    if (!await prisma.universityProfile.findUnique({ where: { id: params.id }, select: { id: true } })) return NextResponse.json({ error: '学校不存在' }, { status: 404 })
    const name = user.nickname || user.username || '同学'
    if (body.replyTo) {
      if (!await prisma.question.findFirst({ where: { id: body.replyTo, universityId: params.id }, select: { id: true } })) return NextResponse.json({ error: '这条评论已经不存在了' }, { status: 404 })
      await prisma.$transaction([
        prisma.reply.create({ data: { id: randomUUID(), content, questionId: body.replyTo, replierId: user.id, replierName: name, isAnonymous: body.isAnonymous === true } }),
        prisma.question.update({ where: { id: body.replyTo }, data: { repliesCount: { increment: 1 } } }),
      ])
    } else {
      await prisma.question.create({ data: { id: randomUUID(), title: content.length > 1 ? content.slice(0, 80) : '校园交流', content, universityId: params.id, askerId: user.id, askerName: name, isAnonymous: body.isAnonymous === true } })
    }
    return NextResponse.json({ ok: true }, { status: 201 })
  } catch (error) {
    console.error('Campus comment failed', error)
    return NextResponse.json({ error: '发送失败，稍后再试试' }, { status: 500 })
  }
}
