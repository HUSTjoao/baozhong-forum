import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authOptions'
import type { ProfileActivity } from '@/lib/profile'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

const publicFields = { id: true, username: true, nickname: true, role: true, universityId: true, graduationYear: true, major: true, avatarUrl: true, bio: true, createdAt: true } as const
const noCache = { 'Cache-Control': 'private, no-store' }
const userView = (user: { username: string | null; nickname: string | null; [key: string]: unknown }) => {
  const { username, ...profile } = user
  return { ...profile, name: user.nickname || username || '一位同学' }
}

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { prisma } = await import('@/lib/prisma')
    const user = await prisma.user.findUnique({ where: { id: params.id }, select: publicFields })
    if (!user) return NextResponse.json({ error: '这位同学的主页暂时不存在。' }, { status: 404, headers: noCache })
    if (request.nextUrl.searchParams.get('summary') === '1') return NextResponse.json({ user: userView(user) }, { headers: noCache })
    const session = await getServerSession(authOptions)
    const isOwner = session?.user?.id === params.id
    const questionWhere = { askerId: params.id, ...(!isOwner && { isAnonymous: false }) }
    const replyWhere = { replierId: params.id, ...(!isOwner && { isAnonymous: false }) }
    const letterWhere = { userId: params.id, ...(!isOwner && { isApproved: true }) }
    const [questions, replies, letters, questionCount, replyCount, letterCount, questionLikes, replyLikes, letterLikes, universities, majors] = await Promise.all([
      prisma.question.findMany({ where: questionWhere, orderBy: { date: 'desc' }, take: 40, select: { id: true, title: true, content: true, date: true, likes: true, repliesCount: true, category: true, isAnonymous: true, universityId: true, majorId: true } }),
      prisma.reply.findMany({ where: replyWhere, orderBy: { date: 'desc' }, take: 40, select: { id: true, content: true, date: true, likes: true, isAnonymous: true, questionId: true, question: { select: { title: true, category: true, universityId: true, majorId: true } } } }),
      prisma.alumniMessage.findMany({ where: letterWhere, orderBy: { createdAt: 'desc' }, take: 40, select: { id: true, content: true, createdAt: true, likes: true, isApproved: true } }),
      prisma.question.count({ where: questionWhere }), prisma.reply.count({ where: replyWhere }), prisma.alumniMessage.count({ where: letterWhere }),
      prisma.question.aggregate({ where: questionWhere, _sum: { likes: true } }), prisma.reply.aggregate({ where: replyWhere, _sum: { likes: true } }), prisma.alumniMessage.aggregate({ where: letterWhere, _sum: { likes: true } }),
      isOwner ? prisma.university.findMany({ where: { creatorId: params.id, isUserAdded: true }, select: { id: true, name: true, reviewStatus: true } }) : [],
      isOwner ? prisma.major.findMany({ where: { creatorId: params.id, isUserAdded: true }, select: { id: true, name: true, reviewStatus: true } }) : [],
    ])
    const topic = (item: { universityId: string | null; majorId: string | null; category: string | null }) => item.universityId ? '校园讨论' : item.majorId ? '专业讨论' : item.category || '问答论坛'
    const activities: ProfileActivity[] = [
      ...questions.map(q => ({ id: q.id, kind: 'question' as const, title: q.title, content: q.content, date: q.date.toISOString(), likes: q.likes, replies: q.repliesCount, href: `/forum/${q.id}`, label: topic(q), anonymous: q.isAnonymous })),
      ...replies.map(r => ({ id: r.id, kind: 'reply' as const, title: r.question.title, content: r.content, date: r.date.toISOString(), likes: r.likes, replies: 0, href: `/forum/${r.questionId}`, label: topic(r.question), anonymous: r.isAnonymous })),
      ...letters.map(m => ({ id: m.id, kind: 'letter' as const, title: '留给下一站的你', content: m.content, date: m.createdAt.toISOString(), likes: m.likes, replies: 0, href: '/messages', label: '一封寄语', pending: m.isApproved !== true })),
    ].sort((a, b) => Date.parse(b.date) - Date.parse(a.date))
    return NextResponse.json({ user: userView(user), isOwner, stats: { questions: questionCount, replies: replyCount, letters: letterCount, likes: (questionLikes._sum.likes || 0) + (replyLikes._sum.likes || 0) + (letterLikes._sum.likes || 0) }, activities, applications: [...universities.map(u => ({ id: u.id, name: u.name, kind: 'university', status: u.reviewStatus || 'pending' })), ...majors.map(m => ({ id: m.id, name: m.name, kind: 'major', status: m.reviewStatus || 'pending' }))] }, { headers: noCache })
  } catch (error) {
    console.error('[profile.get]', error)
    return NextResponse.json({ error: '主页暂时加载失败，请稍后重试。' }, { status: 500, headers: noCache })
  }
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: '请先登录。' }, { status: 401 })
  if (session.user.id !== params.id) return NextResponse.json({ error: '只能修改自己的资料。' }, { status: 403 })
  const body = await request.json().catch(() => null)
  if (!body || typeof body !== 'object' || Array.isArray(body)) return NextResponse.json({ error: '资料格式不正确。' }, { status: 400 })
  const limits: Record<string, number> = { nickname: 24, bio: 200, universityId: 100, major: 80, graduationYear: 20, avatarUrl: 280000 }
  for (const [key, limit] of Object.entries(limits)) {
    if (body[key] !== undefined && (typeof body[key] !== 'string' || body[key].length > limit)) return NextResponse.json({ error: `${key === 'nickname' ? '昵称' : '资料'}长度或格式不正确。` }, { status: 400 })
  }
  if (body.nickname !== undefined && !body.nickname.trim()) return NextResponse.json({ error: '请填写昵称。' }, { status: 400 })
  if (body.avatarUrl && !/^data:image\/(jpeg|png|webp);base64,[a-zA-Z0-9+/=]+$/.test(body.avatarUrl) && !/^https?:\/\//.test(body.avatarUrl)) return NextResponse.json({ error: '请上传 JPG、PNG 或 WebP 头像。' }, { status: 400 })
  try {
    const { prisma } = await import('@/lib/prisma')
    const current = await prisma.user.findUnique({ where: { id: params.id }, select: { role: true } })
    if (!current) return NextResponse.json({ error: '用户不存在。' }, { status: 404 })
    const data: Record<string, string | null> = {}
    for (const key of ['nickname', 'bio', 'avatarUrl']) if (body[key] !== undefined) data[key] = body[key].trim() || null
    if (current.role === 'alumni') {
      for (const key of ['major', 'graduationYear']) if (body[key] !== undefined) data[key] = body[key].trim() || null
      if (data.graduationYear && (!/^\d{4}$/.test(data.graduationYear) || Number(data.graduationYear) < 1900 || Number(data.graduationYear) > new Date().getFullYear())) return NextResponse.json({ error: '请选择有效的毕业年份。' }, { status: 400 })
      if (body.universityId !== undefined) {
        const school = body.universityId.trim()
        const match = school ? await prisma.university.findFirst({ where: { OR: [{ id: school }, { name: school }] }, select: { id: true } }) : null
        data.universityId = match?.id || school || null
      }
    } else if (body.graduationYear !== undefined) {
      if (!['gaoyi', 'gaoer', 'gaosan'].includes(body.graduationYear)) return NextResponse.json({ error: '请选择高一、高二或高三。' }, { status: 400 })
      data.graduationYear = body.graduationYear
    }
    const user = await prisma.user.update({ where: { id: params.id }, data, select: publicFields })
    return NextResponse.json({ user: userView(user) }, { headers: noCache })
  } catch (error) {
    console.error('[profile.patch]', error)
    return NextResponse.json({ error: '保存失败，请稍后再试。' }, { status: 500 })
  }
}
