import 'dotenv/config'
import { existsSync, mkdirSync } from 'node:fs'
import { createRequire } from 'node:module'
import { prisma } from '../lib/prisma'
import { getAllUniversities } from '../data/universities'
import { campusTheme } from '../lib/campus-themes'
import reviewed from '../data/campus-profiles-reviewed.json'
const require = createRequire(import.meta.url)
async function main() {
  if (process.env.DATABASE_PROVIDER === 'postgresql') throw new Error('This import is for the local preview only.')
  mkdirSync('prisma/backups', { recursive: true })
  const Database = require('better-sqlite3')
  const database = new Database('prisma/dev.db', { readonly: true })
  await database.backup('prisma/backups/before-campus-catalog-' + Date.now() + '.db')
  database.close()
  const catalog = getAllUniversities()
  let added = 0
  for (const entry of catalog) {
    const info = reviewed.find(p => p.id === entry.id)
    const region = (value?: string) => (value || '').replace(/(省|市)$/,'').replace('壮族自治区','').replace('回族自治区','').replace('维吾尔自治区','').replace('自治区','')
    const theme = campusTheme(entry.id, info?.accent)
    const profile = info ? { englishName: info.englishName, motto: info.motto, introduction: info.introduction, website: info.website, sourceUrl: info.sourceUrl, accent: theme.key } : { englishName: '', motto: '', introduction: '', website: '', sourceUrl: '', accent: theme.key }
    await prisma.$transaction(async tx => {
      await tx.university.upsert({ where: { id: entry.id }, create: { id: entry.id, name: entry.name, province: region(entry.province), city: region(entry.city), logoUrl: entry.logoUrl && existsSync('public' + entry.logoUrl) ? entry.logoUrl : null, level: info ? '985/211/双一流' : null }, update: {} })
      const existing = await tx.universityProfile.findUnique({ where: { id: entry.id } })
      if (!existing) { await tx.universityProfile.create({ data: { id: entry.id, ...profile } }); added++ }
      else if (info && !existing.introduction) await tx.universityProfile.update({ where: { id: entry.id }, data: profile })
      if (info) await tx.university.update({ where: { id: entry.id }, data: { level: '985/211/双一流' } })
    })
  }
  const logoIds = require('node:fs').readdirSync('public/logos').filter((name: string) => name.endsWith('.png')).map((name: string) => name.slice(0,-4))
  const extraLogos = logoIds.filter((id: string) => !catalog.some(u => u.id === id))
  console.log(JSON.stringify({ catalog: catalog.length, added, reviewed: await prisma.universityProfile.count({ where: { introduction: { not: '' } } }), unmatchedLogoIds: extraLogos }))
}
main().catch(error => { console.error(error); process.exitCode = 1 }).finally(() => prisma.$disconnect())

