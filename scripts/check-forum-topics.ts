import 'dotenv/config'
import assert from 'node:assert/strict'
import { randomUUID } from 'node:crypto'
import { encode } from 'next-auth/jwt'
import { prisma } from '../lib/prisma'
import { forumTopics, forumTopicOf } from '../data/forum-topics'

async function main() {
  if (process.env.DATABASE_PROVIDER === 'postgresql') throw Error('仅允许本地 SQLite 测试。')
  const tag = 'forum-topics-qa-' + randomUUID()
  const cookie = 'next-auth.session-token=' + await encode({ secret: process.env.NEXTAUTH_SECRET || 'your-secret-key-change-in-production', token: { id: tag, sub: tag } })
  async function call(path: string, method = 'GET', body?: unknown) {
    const response = await fetch('http://127.0.0.1:3000' + path, { method, headers: { Cookie: cookie, 'Content-Type': 'application/json' }, body: body ? JSON.stringify(body) : undefined })
    return { status: response.status, body: await response.json() }
  }
  try {
    await prisma.user.create({ data: { id: tag, email: tag + '@example.invalid', password: 'qa-only' } })
    const created: { id: string; category: string }[] = []
    for (const topic of forumTopics.slice(1)) {
      const result = await call('/api/questions', 'POST', { title: tag, content: '分类回归检查', category: topic.name, isAnonymous: true })
      assert.equal(result.status, 201)
      assert.equal(result.body.question.category, topic.name, '发布返回用户所选话题')
      created.push({ id: result.body.question.id, category: topic.name })
    }
    const list = await call('/api/questions/list')
    assert.equal(list.status, 200)
    for (const item of created) {
      const question = list.body.questions.find((q: { id: string }) => q.id === item.id)
      assert.equal(question.category, item.category, '刷新列表后类型不丢失')
      assert.equal(question.askerName, '匿名同学')
      assert.equal((await call('/api/questions/' + item.id)).body.question.category, item.category)
    }
    await prisma.question.update({ where: { id: created[0].id }, data: { category: '志愿填报' } })
    const legacy = (await call('/api/questions/list')).body.questions.find((q: { id: string }) => q.id === created[0].id)
    assert.equal(legacy.category, '志愿填报')
    assert.equal(forumTopicOf(legacy.category), '升学与专业', '旧分类继续正确归组')
    for (const category of ['不存在的分类', [], 42, '']) assert.equal((await call('/api/questions', 'POST', { title: tag, content: 'QA', category })).status, 400)
    const alias = await call('/api/questions', 'POST', { title: tag, content: 'QA', category: '复习备考' })
    assert.equal(alias.body.question.category, '学习与备考')
    console.log('PASS: 所有话题发布、列表刷新、详情、匿名显示、旧分类兼容及无效类型拒绝。')
  } finally {
    await prisma.question.deleteMany({ where: { askerId: tag } })
    await prisma.user.deleteMany({ where: { id: tag } })
  }
}
main().catch(error => { console.error(error); process.exitCode = 1 }).finally(() => prisma.$disconnect())
