import { getAllUniversities } from '@/data/universities'
import { prisma } from '@/lib/prisma'
import UniversityExplorer from '@/components/universities/UniversityExplorer'
export const dynamic = 'force-dynamic'
export default async function UniversitiesPage() {
  const profiles = await prisma.universityProfile.findMany({ include: { university: true }, orderBy: { createdAt: 'asc' } })
  const order = getAllUniversities().map(u => u.id).filter(id => id !== 'hust')
  order.splice(7, 0, 'hust')
  const positions = new Map(order.map((id, index) => [id, index]))
  profiles.sort((a, b) => (positions.get(a.id) ?? order.length) - (positions.get(b.id) ?? order.length))
  const region = (value?: string | null) => (value || '').replace(/(省|市)$/,'').replace('壮族自治区','').replace('回族自治区','').replace('维吾尔自治区','').replace('自治区','')
  return <UniversityExplorer universities={profiles.map(p => ({ id: p.id, name: p.university.name, englishName: p.englishName, motto: p.motto, province: region(p.university.province), city: region(p.university.city), logoUrl: p.university.logoUrl, accent: p.accent, level: p.university.level }))} />
}



