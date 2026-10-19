import { NextRequest, NextResponse } from 'next/server'
import { randomUUID } from 'node:crypto'
import { prisma } from '@/lib/prisma'
import { campusPhotoUser, photoMutationOrigin, publicPhoto } from '@/lib/campus-photo-access'
import { campusPhotoCategories, campusPhotoUploadLimit } from '@/lib/campus-photos-shared'
import { compressCampusPhoto, PhotoInputError, removeCampusPhoto, storeCampusPhoto, validPhotoId } from '@/lib/campus-photo-storage'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
let activeUploads = 0

export async function GET(request: NextRequest) {
  try {
    const scope = request.nextUrl.searchParams.get('scope') || 'public'
    if (!['public', 'mine', 'admin'].includes(scope)) return NextResponse.json({ error: '列表类型不正确' }, { status: 400 })
    const user = scope === 'public' ? null : await campusPhotoUser()
    if (scope !== 'public' && !user) return NextResponse.json({ error: '请先登录' }, { status: 401 })
    if (scope === 'admin' && user?.role !== 'admin') return NextResponse.json({ error: '仅管理员可查看审核列表' }, { status: 403 })
    const status = request.nextUrl.searchParams.get('status') || 'pending'
    if (scope === 'admin' && !['pending', 'approved', 'rejected'].includes(status)) return NextResponse.json({ error: '审核状态不正确' }, { status: 400 })
    const cursor = request.nextUrl.searchParams.get('cursor')
    if (cursor && !validPhotoId(cursor)) return NextResponse.json({ error: '翻页参数不正确' }, { status: 400 })
    const where = scope === 'public' ? { status: 'approved' } : scope === 'mine' ? { userId: user!.id } : { status }
    const rows = await prisma.campusPhoto.findMany({ where, orderBy: [{ createdAt: 'desc' }, { id: 'desc' }], take: 31, ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}), select: { id: true, title: true, category: true, width: true, height: true, status: true, reviewNote: true, createdAt: true, user: { select: { nickname: true, username: true } } } })
    const items = rows.slice(0, 30).map(row => scope === 'public' ? publicPhoto({ id: row.id, title: row.title, category: row.category, width: row.width, height: row.height }) : publicPhoto(row))
    return NextResponse.json({ items, nextCursor: rows.length > 30 ? rows[29].id : null }, { headers: { 'Cache-Control': 'no-store' } })
  } catch { return NextResponse.json({ error: '照片暂时无法加载，请稍后重试' }, { status: 503 }) }
}

// Bound the actual streamed body too, rather than trusting Content-Length.
async function limitedForm(request: Request) {
  const limit = campusPhotoUploadLimit + 128 * 1024
  if (Number(request.headers.get('content-length')) > limit) throw new PhotoInputError('上传内容过大，请选择 8 MB 以内的图片')
  const reader = request.body?.getReader()
  if (!reader) throw new PhotoInputError('请选择图片')
  const chunks: Uint8Array[] = []; let size = 0
  try {
    while (true) {
      const part = await reader.read(); if (part.done) break
      size += part.value.byteLength
      if (size > limit) { await reader.cancel(); throw new PhotoInputError('上传内容过大，请选择 8 MB 以内的图片') }
      chunks.push(part.value)
    }
    return await new Response(Buffer.concat(chunks), { headers: { 'Content-Type': request.headers.get('content-type') || '' } }).formData()
  } catch (error) { if (error instanceof PhotoInputError) throw error; throw new PhotoInputError('上传格式不正确，请重新选择图片') }
  finally { reader.releaseLock() }
}

export async function POST(request: Request) {
  const originError = photoMutationOrigin(request); if (originError) return originError
  const user = await campusPhotoUser()
  if (!user) return NextResponse.json({ error: '请先登录后上传' }, { status: 401 })
  if (user.isMuted) return NextResponse.json({ error: '当前账号暂时无法上传照片' }, { status: 403 })
  if (activeUploads >= 2) return NextResponse.json({ error: '正在处理其他照片，请稍后再试' }, { status: 429 })
  activeUploads++
  let storedId: string | null = null
  try {
    const since = new Date(Date.now() - 86400000)
    const daily = await prisma.campusPhoto.count({ where: { userId: user.id, createdAt: { gte: since } } })
    const pending = await prisma.campusPhoto.count({ where: { userId: user.id, status: 'pending' } })
    if (daily >= 10 || pending >= 5) return NextResponse.json({ error: '每天最多投稿 10 张，待审核最多 5 张；请等待审核后再来' }, { status: 429 })
    const form = await limitedForm(request)
    const title = typeof form.get('title') === 'string' ? String(form.get('title')).trim() : ''
    const category = form.get('category')
    if (title.length < 2 || title.length > 40 || !campusPhotoCategories.includes(category as typeof campusPhotoCategories[number])) throw new PhotoInputError('请填写 2–40 字标题，并选择照片分类')
    if (form.get('consent') !== 'yes') throw new PhotoInputError('请确认你拥有照片的使用授权')
    const file = form.get('photo')
    if (!file || typeof file === 'string' || file.size > campusPhotoUploadLimit) throw new PhotoInputError('请选择 8 MB 以内的图片')
    const image = await compressCampusPhoto(Buffer.from(await file.arrayBuffer()))
    const id = randomUUID()
    await storeCampusPhoto(id, image.full, image.thumbnail); storedId = id
    const photo = await prisma.$transaction(async tx => {
      const freshUser = await tx.user.findUnique({ where: { id: user.id }, select: { isMuted: true } })
      if (!freshUser || freshUser.isMuted) throw new PhotoInputError('当前账号暂时无法上传照片')
      if (await tx.campusPhoto.count({ where: { userId: user.id, status: 'pending' } }) >= 5 || await tx.campusPhoto.count({ where: { userId: user.id, createdAt: { gte: since } } }) >= 10) throw new PhotoInputError('投稿数量已达上限，请等待审核后再来')
      return tx.campusPhoto.create({ data: { id, title, category: String(category), userId: user.id, width: image.width, height: image.height, bytes: image.bytes } })
    }, { isolationLevel: 'Serializable' })
    storedId = null
    return NextResponse.json({ id: photo.id, status: 'pending', message: '照片已提交，审核通过后会出现在照片墙。' }, { status: 201, headers: { 'Cache-Control': 'no-store' } })
  } catch (error) {
    if (storedId) await removeCampusPhoto(storedId).catch(() => {})
    return NextResponse.json({ error: error instanceof PhotoInputError ? error.message : '上传暂时未完成，请稍后重试' }, { status: error instanceof PhotoInputError ? 400 : 503 })
  } finally { activeUploads-- }
}
