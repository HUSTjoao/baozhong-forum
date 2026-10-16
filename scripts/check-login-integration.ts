import 'dotenv/config'
import assert from 'node:assert/strict'
import { randomUUID } from 'node:crypto'
import bcrypt from 'bcryptjs'
import { prisma } from '../lib/prisma'

// Uses temporary local fixtures only; never resets an existing user's password.
async function main() {
  if (process.env.DATABASE_PROVIDER === 'postgresql') throw Error('仅允许在本地 SQLite 测试。')
  const origin = 'http://127.0.0.1:3000'
  const tag = 'login-qa-' + randomUUID(), password = randomUUID()
  const ids = [tag + '-admin', tag + '-student']
  try {
    for (const role of ['admin', 'student']) {
      const id = tag + '-' + role
      await prisma.user.create({ data: { id, username: id, email: id + '@example.invalid', password: await bcrypt.hash(password, 12), role } })
      async function login(candidate: string) {
        const csrfResponse = await fetch(origin + '/api/auth/csrf')
        const { csrfToken } = await csrfResponse.json()
        const csrfCookies = csrfResponse.headers.getSetCookie().map(s => s.split(';')[0]).join('; ')
        const response = await fetch(origin + '/api/auth/callback/credentials', {
          method: 'POST', redirect: 'manual', headers: { Cookie: csrfCookies, 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams({ csrfToken, username: id, password: candidate, json: 'true', callbackUrl: origin + '/forum' }),
        })
        return response
      }
      const rejected = await login(randomUUID())
      assert.equal(rejected.status, 401, 'Incorrect password must be rejected')
      const accepted = await login(password)
      assert.equal(accepted.status, 200)
      const cookies = accepted.headers.getSetCookie().map(s => s.split(';')[0]).join('; ')
      assert.match(cookies, /next-auth\.session-token=/)
      const sessionResponse = await fetch(origin + '/api/auth/session', { headers: { Cookie: cookies } })
      const session = await sessionResponse.json()
      assert.equal(session.user.id, id)
      assert.equal(session.user.role, role)
      assert.equal('password' in session.user, false)
      const adminResponse = await fetch(origin + '/api/admin', { headers: { Cookie: cookies } })
      assert.equal(adminResponse.status, role === 'admin' ? 200 : 403)
    }
    for (const path of ['/', '/auth/login', '/forum', '/messages', '/majors', '/universities', '/majors/computer-science/forum']) {
      assert.equal((await fetch(origin + path)).status, 200, path)
    }
    console.log('PASS: 真实账号密码登录、错误密码拒绝、会话角色、管理权限及主要页面响应。')
  } finally {
    await prisma.user.deleteMany({ where: { id: { in: ids } } })
  }
}
main().catch(error => { console.error(error); process.exitCode = 1 }).finally(() => prisma.$disconnect())
