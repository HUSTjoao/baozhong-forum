import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { majors, majorAliases, getMajorById, mergeApprovedMajors, type MajorCategory } from '../data/majors'
import { majorEnglishNames } from '../data/major-english-names'
import { majorDirectionOf, majorDirections } from '../data/major-directions'

const officialNames: Record<string, string> = JSON.parse(readFileSync('docs/major-catalog-2026.json', 'utf8'))
const ids = new Set<string>()
const names = new Set<string>()
const categories: Record<MajorCategory, number> = { arts: 0, science: 0, engineering: 0, medicine: 0, other: 0 }
for (const major of majors) {
  assert(!ids.has(major.id), `重复 ID：${major.id}`)
  assert(!names.has(major.name), `重复名称：${major.name}`)
  ids.add(major.id)
  names.add(major.name)
  assert(major.officialCode, `缺少本科专业代码：${major.name}`)
  assert.notEqual(majorDirectionOf(major), 'uncategorized', `缺少二级目录：${major.name}`)
  assert(majorDirections[major.category].some(direction => direction.id === majorDirectionOf(major)), `二级目录跨板块：${major.name}`)
  assert.equal(officialNames[major.officialCode], major.name, `代码与名称不一致：${major.name}`)
  const prefix = major.officialCode.slice(0, 2)
  const interdisciplinaryDisplayGroups: Record<string, MajorCategory> = { '140003TK': 'engineering', '140011TK': 'medicine' }
  const expected = interdisciplinaryDisplayGroups[major.officialCode] ?? (['09', '13'].includes(prefix) || major.officialCode.startsWith('0402')
    ? 'other' : ({ '07': 'science', '08': 'engineering', '10': 'medicine' }[prefix] ?? 'arts'))
  assert.equal(major.category, expected, `错误分类：${major.name}`)
  assert(majorEnglishNames[major.name]?.trim(), `缺少英文名：${major.name}`)
  assert(major.description.length >= 110, `介绍不足：${major.name}`)
  assert((major.description.match(/[。！？]/g)?.length ?? 0) >= 3, `介绍未覆盖三个层次：${major.name}`)
  categories[major.category]++
}
for (const [alias, id] of Object.entries(majorAliases)) {
  assert(!ids.has(alias), `旧 ID 与当前专业冲突：${alias}`)
  assert(ids.has(id), `旧 ID 指向不存在的专业：${alias}`)
  assert.equal(getMajorById(alias)?.id, id)
}
const regressionCases: Record<string, MajorCategory> = {
  '智能科学与技术': 'engineering', '制药工程': 'engineering', '生物医学工程': 'engineering',
  '工业设计': 'engineering', '食品科学与工程': 'engineering', '森林工程': 'engineering',
  '农业机械化及其自动化': 'engineering', '金融科技': 'arts', '心理学': 'science',
  '学前教育': 'arts', '经济学': 'arts', '会计学': 'arts', '动物医学': 'other',
  '园林': 'other', '风景园林': 'engineering', '播音与主持艺术': 'other', '体育教育': 'other',
}
for (const [name, category] of Object.entries(regressionCases)) {
  assert.equal(majors.find(major => major.name === name)?.category, category, name)
}
const custom = { ...majors[0], id: 'custom-test', name: '用户自定义测试专业', isApproved: true }
const merged = mergeApprovedMajors([
  { ...majors[0], id: 'duplicate-local', category: 'other' },
  { ...majors[0], id: 'pending-test', name: '待审核专业', isApproved: false },
  custom, custom,
])
assert.equal(merged.length, majors.length + 1)
assert.equal(merged.find(major => major.name === '计算机科学与技术')?.category, 'engineering')
assert.equal(merged.filter(major => major.id === custom.id).length, 1)
console.log(`专业数据检查通过：${majors.length} 个本科专业；${Object.keys(majorAliases).length} 个旧链接兼容。`)
console.log(categories)
const directionCases = { 飞行器适航技术: 'aerospace', 软件工程: 'computing', 人工智能: 'electronics', 自动化: 'electronics', 金融学: 'economics', 心理学: 'psychology', 动画: 'design', 风景园林: 'construction', 园林: 'agriculture', 体育教育: 'sports' }
for (const [name, direction] of Object.entries(directionCases)) assert.equal(majorDirectionOf(majors.find(major => major.name === name)!), direction, name)
assert.equal(majorDirectionOf({ name: '尚未分类的新专业', category: 'engineering' }), 'uncategorized', '未识别的新专业不根据关键词猜测分类')
