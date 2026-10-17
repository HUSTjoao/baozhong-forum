import 'dotenv/config'
import { majors } from '../data/majors'
import { prisma } from '../lib/prisma'
import { recentMajorIds } from '../data/major-additions-20261017'

async function main() {
  const args = process.argv.slice(2)
  if (args.some(value => value.startsWith('--') && !['--apply', '--recent'].includes(value))) throw Error('存在不支持的参数。')
  if (args.includes('--recent') && args.some(value => !value.startsWith('--'))) throw Error('--recent 与单个专业 ID 不能同时使用。')
  const ids = [...new Set(args.includes('--recent') ? recentMajorIds : args.filter(value => !value.startsWith('--')))]
  const entries = ids.map(id => majors.find(item => item.id === id))
  if (!entries.length || entries.some(major => !major)) throw Error('请提供已收录的预置专业 ID，或使用 --recent 同步本批新增专业。')
  if (!args.includes('--apply')) { console.log(`计划：仅同步 ${entries.map(major => major!.name).join('、')}，不修改其他专业或帖子。添加 --apply 执行。`); return }
  await prisma.$transaction(async tx => {
    for (const major of entries) {
      if (!major) throw Error('未找到专业。')
      const existing = await tx.major.findMany({ where: { OR: [{ id: major.id }, { name: major.name }] } })
      if (existing.some(item => item.id !== major.id || item.isUserAdded)) throw Error('存在同名专业或用户资料冲突，整批同步已停止。')
      const data = { name: major.name, category: major.category, description: major.description, strongUniversities: major.strongUniversities, isApproved: true, reviewStatus: 'approved' }
      await tx.major.upsert({ where: { id: major.id }, create: { id: major.id, hotScore: major.hotScore, ...data }, update: data })
    }
  })
  console.log(`已同步 ${entries.length} 个专业，详情和讨论可使用。其他专业及现有帖子未修改。`)
}
main().catch(error => { console.error(error.message); process.exitCode = 1 }).finally(() => prisma.$disconnect())
