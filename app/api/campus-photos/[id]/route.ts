import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/admin-access'
import { photoMutationOrigin } from '@/lib/campus-photo-access'
import { validPhotoId } from '@/lib/campus-photo-storage'
export const dynamic = 'force-dynamic'
export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const originError = photoMutationOrigin(request); if (originError) return originError
  const access = await requireAdmin(); if (access.error) return access.error
  const { id } = await context.params
  if (!validPhotoId(id)) return NextResponse.json({ error: '照片不存在' }, { status: 404 })
  try {
    const body = await request.json()
    if (!body || !['approved', 'rejected'].includes(body.status) || (body.note != null && typeof body.note !== 'string')) return NextResponse.json({ error: '审核操作不正确' }, { status: 400 })
    const note = (body.note || '').trim()
    if (note.length > 200 || (body.status === 'rejected' && note.length < 2)) return NextResponse.json({ error: '不通过时请填写 2–200 字原因' }, { status: 400 })
    const result = await prisma.campusPhoto.updateMany({ where: { id }, data: { status: body.status, reviewNote: note || null, reviewerId: access.user.id, reviewedAt: new Date() } })
    if (!result.count) return NextResponse.json({ error: '照片不存在' }, { status: 404 })
    return NextResponse.json({ ok: true }, { headers: { 'Cache-Control': 'no-store' } })
  } catch { return NextResponse.json({ error: '审核未完成，请重新加载后再试' }, { status: 400 }) }
}
