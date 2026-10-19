import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { campusPhotoUser } from '@/lib/campus-photo-access'
import { readCampusPhoto, validPhotoId } from '@/lib/campus-photo-storage'
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params
  const missing = () => new NextResponse(null, { status: 404, headers: { 'Cache-Control': 'no-store' } })
  if (!validPhotoId(id)) return missing()
  try {
    const photo = await prisma.campusPhoto.findUnique({ where: { id }, select: { status: true, userId: true } })
    if (!photo) return missing()
    if (photo.status !== 'approved') {
      const user = await campusPhotoUser()
      if (!user || (user.id !== photo.userId && user.role !== 'admin')) return missing()
    }
    const bytes = await readCampusPhoto(id, request.nextUrl.searchParams.get('size') === 'thumb')
    return new NextResponse(new Uint8Array(bytes), { headers: { 'Content-Type': 'image/webp', 'Content-Length': String(bytes.length), 'X-Content-Type-Options': 'nosniff', 'Cache-Control': 'private, no-store' } })
  } catch { return missing() }
}
