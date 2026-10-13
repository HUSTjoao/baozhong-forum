import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authOptions'
export const dynamic = 'force-dynamic'
export async function POST(_req: NextRequest, { params }: { params: { id: string } }) {
 try {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: '请先登录' }, { status: 401 })
  const { prisma } = await import('@/lib/prisma')
  const userId = session.user.id, messageId = params.id
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { isMuted: true } })
  if (!user || user.isMuted) return NextResponse.json({ error: '当前账号暂时无法点赞' }, { status: 403 })
  const result = await prisma.$transaction(async tx => {
   const target = await tx.alumniMessage.findFirst({ where: { id: messageId, isApproved: true }, select: { id: true } })
   if (!target) return null
   const existing = await tx.alumniMessageLike.findUnique({ where: { messageId_userId: { messageId, userId } } })
   if (existing) {
    const deleted = await tx.alumniMessageLike.deleteMany({ where: { messageId, userId } })
    if (deleted.count) await tx.alumniMessage.updateMany({ where: { id: messageId, likes: { gt: 0 } }, data: { likes: { decrement: 1 } } })
   } else {
    await tx.alumniMessageLike.create({ data: { messageId, userId } })
    await tx.alumniMessage.update({ where: { id: messageId }, data: { likes: { increment: 1 } } })
   }
   const message = await tx.alumniMessage.findUniqueOrThrow({ where: { id: messageId }, include: { likesRel: { select: { userId: true } }, user: { select: { id: true, nickname: true, username: true, avatarUrl: true, universityId: true, graduationYear: true, major: true } } } })
   return { message, liked: !existing }
  })
  if (!result) return NextResponse.json({ error: '寄语不存在或尚未公开' }, { status: 404 })
  return NextResponse.json(result, { headers: { 'Cache-Control': 'no-store' } })
 } catch (error) {
  if (error && typeof error === 'object' && 'code' in error && error.code === 'P2002') return NextResponse.json({ error: '点赞状态正在更新，请稍后重试' }, { status: 409 })
  return NextResponse.json({ error: '点赞失败，请稍后重试' }, { status: 500 })
 }
}
