import { getServerSession } from 'next-auth'
import { NextResponse } from 'next/server'
import { authOptions } from './authOptions'
import { prisma } from './prisma'

export async function campusPhotoUser() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return null
  return prisma.user.findUnique({ where: { id: session.user.id }, select: { id: true, role: true, isMuted: true } })
}
export function photoMutationOrigin(request: Request) {
  const origin = request.headers.get('origin')
  const allowed = [new URL(request.url).origin]
  const host = request.headers.get('host')
  if (host) allowed.push(`${new URL(request.url).protocol}//${host}`)
  if (process.env.NEXTAUTH_URL) allowed.push(new URL(process.env.NEXTAUTH_URL).origin)
  if (!origin || !allowed.includes(origin)) return NextResponse.json({ error: '请从本站页面重新提交' }, { status: 403 })
  return null
}
export function publicPhoto(photo: { id: string; title: string; category: string; width: number; height: number }) {
  return { ...photo, src: `/api/campus-photos/${photo.id}/image`, thumbnail: `/api/campus-photos/${photo.id}/image?size=thumb` }
}
