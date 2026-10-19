import 'dotenv/config'
import assert from 'node:assert/strict'
import { randomUUID } from 'node:crypto'
import { unlink } from 'node:fs/promises'
import { spawnSync } from 'node:child_process'
import { resolve, dirname } from 'node:path'
import { encode } from 'next-auth/jwt'
import sharp from 'sharp'
import { prisma } from '../lib/prisma'

async function main() {
  if (process.env.DATABASE_PROVIDER === 'postgresql') throw Error('仅允许本地 SQLite 回归，不写生产库。')
  const base = 'http://127.0.0.1:3000'
  const tag = 'photo-qa-' + randomUUID()
  const users = [tag + '-user', tag + '-admin', tag + '-other', tag + '-muted']
  const ids: string[] = []
  const cookies: string[] = []
  async function request(path: string, user?: number, method = 'GET', body?: BodyInit, extra: Record<string, string> = {}) {
    return fetch(base + path, { method, headers: { ...(user !== undefined ? { Cookie: cookies[user] } : {}), ...(method !== 'GET' ? { Origin: base } : {}), ...extra }, body })
  }
  const source = await sharp({ create: { width: 1800, height: 1200, channels: 3, background: '#648359' } }).jpeg().toBuffer()
  function upload(bytes = source, mime = 'image/jpeg') {
    const form = new FormData(); form.set('title', '校园照片回归检查'); form.set('category', '校园'); form.set('consent', 'yes'); form.set('photo', new Blob([new Uint8Array(bytes)], { type: mime }), 'campus.jpg'); return form
  }
  try {
    for (let index = 0; index < users.length; index++) {
      await prisma.user.create({ data: { id: users[index], email: users[index] + '@example.invalid', username: users[index], password: 'not-a-login-hash', role: index === 1 ? 'admin' : 'student', isMuted: index === 3 } })
      cookies.push('next-auth.session-token=' + await encode({ secret: process.env.NEXTAUTH_SECRET || 'your-secret-key-change-in-production', token: { id: users[index], sub: users[index], role: index === 1 ? 'admin' : 'student' } }))
    }
    assert.equal((await request('/api/campus-photos', undefined, 'POST', upload())).status, 401)
    assert.equal((await request('/api/campus-photos', 3, 'POST', upload())).status, 403)
    assert.equal((await request('/api/campus-photos', 0, 'POST', upload(), { Origin: 'https://example.invalid' })).status, 403)
    assert.equal((await request('/api/campus-photos', 0, 'POST', upload(Buffer.from('<svg><script>alert(1)</script></svg>'), 'image/jpeg'))).status, 400)
    const tooSmall = await sharp({ create: { width: 100, height: 100, channels: 3, background: '#777777' } }).png().toBuffer()
    assert.equal((await request('/api/campus-photos', 0, 'POST', upload(tooSmall))).status, 400)
    assert.equal((await request('/api/campus-photos', 0, 'POST', upload(Buffer.alloc(8 * 1024 * 1024 + 1)))).status, 400)
    const created = await request('/api/campus-photos', 0, 'POST', upload()); const result = await created.json()
    assert.equal(created.status, 201, JSON.stringify(result)); ids.push(result.id)
    const id = result.id
    assert.equal((await prisma.campusPhoto.findUniqueOrThrow({ where: { id } })).status, 'pending')
    assert.equal((await request(`/api/campus-photos/${id}/image`)).status, 404)
    assert.equal((await request(`/api/campus-photos/${id}/image`, 2)).status, 404)
    assert.equal((await request(`/api/campus-photos/${id}/image`, 0)).status, 200)
    assert.equal((await request(`/api/campus-photos/${id}/image`, 1)).status, 200)
    assert.equal((await request('/api/campus-photos?scope=admin', 0)).status, 403)
    assert(!(await (await request('/api/campus-photos')).json()).items.some((p: { id: string }) => p.id === id))
    async function review(user: number, status: string, note?: string) { return request(`/api/campus-photos/${id}`, user, 'PATCH', JSON.stringify({ status, note }), { 'Content-Type': 'application/json' }) }
    assert.equal((await review(0, 'approved')).status, 403)
    assert.equal((await review(1, 'approved')).status, 200)
    const publicList = await (await request('/api/campus-photos')).json()
    assert(publicList.items.some((p: { id: string }) => p.id === id))
    assert(!('userId' in publicList.items.find((p: { id: string }) => p.id === id)))
    const image = await request(`/api/campus-photos/${id}/image`)
    assert.equal(image.status, 200); assert.equal(image.headers.get('content-type'), 'image/webp')
    const metadata = await sharp(Buffer.from(await image.arrayBuffer())).metadata()
    assert.equal(metadata.format, 'webp'); assert(!metadata.exif); assert(!metadata.xmp)
    assert((metadata.width || 0) <= 1920)
    assert.equal((await review(1, 'rejected')).status, 400)
    assert.equal((await review(1, 'rejected', '测试撤下，不公开展示')).status, 200)
    assert.equal((await request(`/api/campus-photos/${id}/image`)).status, 404)
    assert(!(await (await request('/api/campus-photos')).json()).items.some((p: { id: string }) => p.id === id))
    for (let n = 0; n < 5; n++) { const extraId = randomUUID(); ids.push(extraId); await prisma.campusPhoto.create({ data: { id: extraId, userId: users[0], title: '限额测试', category: '校园', width: 640, height: 420, bytes: 1 } }) }
    assert.equal((await request('/api/campus-photos', 0, 'POST', upload())).status, 429)
    console.log('PASS: 上传鉴权、禁言、跨站请求、伪装/超限/小图拒绝、压缩、隐私元数据移除、待审隔离、管理员审核、公开展示、撤下、投稿限额。')
    const browserScript = process.argv[process.argv.indexOf('--browser-script') + 1]
    if (process.argv.includes('--browser-script') && browserScript) {
      const browser = spawnSync(process.execPath, [resolve(browserScript)], { cwd: dirname(resolve(browserScript)), input: JSON.stringify({ base, userCookie: cookies[2], adminCookie: cookies[1] }), encoding: 'utf8', timeout: 240000 })
      console.log(browser.stdout); if (browser.stderr) console.error(browser.stderr)
      assert.equal(browser.status, 0, '浏览器上传与审核闭环通过')
    }
  } finally {
    const photos = await prisma.campusPhoto.findMany({ where: { userId: { in: users } }, select: { id: true } })
    await prisma.campusPhoto.deleteMany({ where: { userId: { in: users } } })
    for (const photo of photos) for (const suffix of ['', '-thumb']) { try { await unlink(resolve(process.env.CAMPUS_PHOTO_STORAGE_DIR || '.uploads/campus', photo.id + suffix + '.webp')) } catch (error) { if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error } }
    await prisma.user.deleteMany({ where: { id: { in: users } } })
  }
}
main().catch(error => { console.error(error); process.exitCode = 1 }).finally(() => prisma.$disconnect())
