import assert from 'node:assert/strict'
import catalog from '../data/shaanxi-admissions-catalog.json'
import officialAdditions from '../data/admissions-sources/reviewed-additions.json'
import publicReferences from '../data/admissions-sources/public-reference-records.json'
import { getShaanxiAdmissions } from '../lib/shaanxi-admissions'
import { admissionScoreRank, type UniversityAdmissions } from '../data/shaanxi-admissions'
const schools = Object.values(catalog) as unknown as UniversityAdmissions[]
assert.equal(schools.length, 149)
let records = 0
for (const school of schools) {
  const data = getShaanxiAdmissions(school.universityId)!
  assert.equal(data.name, school.name)
  for (const year of data.years) {
    const entry = data.records[year]
    if (!entry) continue
    assert(entry.source.startsWith('http'))
    const keys = new Set<string>()
    for (const row of entry.records) {
      records++
      assert(Number.isInteger(row.score) && row.score > 0 && row.score <= 750)
      assert(!row.highest || row.highest >= row.score)
      assert(!keys.has(row.code + row.subject + row.batch + row.category + row.label))
      keys.add(row.code + row.subject + row.batch + row.category + row.label)
      if (entry.kind === 'submission') {
        assert.equal(year, 2024)
        assert(row.rank && row.rank > 0)
        assert(row.source?.includes('sneac.com'))
      } else {
        assert(!row.rank, '录取统计不能写入精确投档位次')
        const band = admissionScoreRank(entry, row.subject, row.score)
        if (band) {
          assert(band.start > 0 && band.start <= band.end)
          const raw: { count: number; cumulative: number } = entry.distribution![row.subject]!.scores[row.score]
          assert.equal(band.end - band.start + 1, raw.count)
        }
        if (entry.kind === 'reference') {
          assert.notEqual(new URL(row.source || entry.source).hostname, 'gaokaozy.cn', '隔离来源不能进入展示数据')
          assert(band && row.publishedRank, '公开参考必须通过同年同科类位次核对')
          assert(row.publishedRank >= band.start && row.publishedRank <= band.end, `${school.name} ${year} 参考分数与省位次不一致`)
          assert(!row.highest, '第三方最低分表不能推算最高分')
        }
      }
    }
    for (const subject of ['arts','science'] as const) {
      const main = entry.records.filter(r => r.subject === subject && !r.additional)
      if (main.length) assert(Number.isFinite(Math.min(...main.map(r => r.score))))
    }
  }
}
const hust = getShaanxiAdmissions('hust')!
const nju2025 = getShaanxiAdmissions('nju')!.records[2025]!
assert(nju2025.records.some(r => r.subject === 'science' && !r.additional && r.score === 678), '南京2025普通分组参考不能被专项表挤掉')
assert(nju2025.records.some(r => r.subject === 'science' && r.additional && r.score === 651), '南京2025国家专项须单独保留')
assert(nju2025.records.some(r => r.subject === 'arts' && !r.additional && r.score === 658))
const neau2026 = getShaanxiAdmissions('neau')!.records[2026]!
assert.equal(neau2026.kind, 'admission')
assert(neau2026.records.some(r => r.subject === 'science' && !r.additional && r.score === 546))
assert(neau2026.records.some(r => r.subject === 'arts' && !r.additional && r.score === 550))
assert(getShaanxiAdmissions('muc')!.records[2026]!.records.some(r => r.subject === 'science' && !r.additional && r.score === 608))
assert(getShaanxiAdmissions('hustc')!.records[2026]!.records.every(r => r.additional), '公费师范、优师和专项不得混成普通本科批')
const bjut2025 = getShaanxiAdmissions('bjut')!.records[2025]!
assert.equal(bjut2025.records.length, 7, 'PDF下一省份的行不能并入陕西')
assert.equal(bjut2025.records.filter(r => !r.additional).length, 4)
assert(!bjut2025.records.some(r => r.label.includes('机器人工程')), '上海行不能并入陕西')
const nefu2026 = getShaanxiAdmissions('nefu')!.records[2026]!
assert.equal(nefu2026.kind, 'reference', '掌上高考资料不得升级成官方数据')
assert(nefu2026.records.some(r => r.subject === 'science' && !r.additional && r.score === 555))
assert(nefu2026.records.some(r => r.subject === 'arts' && !r.additional && r.score === 550))
const ncu2025 = getShaanxiAdmissions('ncu')!.records[2025]!
assert(ncu2025.records.some(r => r.subject === 'arts' && !r.additional && r.score === 574), '南昌2025历史公开参考不能漏掉')
const sustech2024 = getShaanxiAdmissions('sustech')!.records[2024]!
assert.equal(sustech2024.kind, 'reference')
assert(sustech2024.records.some(r => r.score === 619 && r.subject === 'science' && r.additional), '提前批C段记录不能混入普通批')
assert(sustech2024.records.every(r => r.subject !== 'arts'), '南科大理科不能填到文史')
for (const ref of publicReferences) {
  const selected = getShaanxiAdmissions(ref.id)!.records[ref.year]
  if (selected?.kind !== 'reference') continue
  for (const row of ref.dataset.records) {
    assert(selected.records.some(r => r.subject === row.subject && Boolean(r.additional) === Boolean('additional' in row && row.additional)), `${ref.id} ${ref.year}: 主表与专项记录不能相互挤掉`)
  }
}
for (const official of officialAdditions) {
  const retained = getShaanxiAdmissions(official.id)!.records[official.year]!
  assert.equal(retained.kind, 'admission', '公开参考不能替换官方记录')
  assert.deepEqual(retained.records, official.dataset.records)
}
assert.deepEqual(admissionScoreRank(hust.records[2026], 'science', 650), {start:2769,end:2889,source:'https://www.sneea.cn/info/1027/17658.htm'})
assert.equal(getShaanxiAdmissions('xju')!.name, '西安交通大学')
assert.equal(getShaanxiAdmissions('xjdx')!.name, '新疆大学')
assert.equal(getShaanxiAdmissions('ccnu')!.name, '华中农业大学')
assert.equal(getShaanxiAdmissions('hustc')!.name, '华中师范大学')
assert.equal(getShaanxiAdmissions('missing'), undefined)
const complete = schools.filter(s => s.years.every(y => s.records[y])).length
console.log(`PASS ${schools.length} universities, ${records} records, ${complete} with all three years; source, subject, rank and identity checks`)
