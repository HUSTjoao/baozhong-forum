import 'dotenv/config'
import { prisma } from '../lib/prisma'
import { getAllUniversities } from '../data/universities'
import { majors } from '../data/majors'

async function main() {
  if (process.env.DATABASE_PROVIDER === 'postgresql') {
    throw new Error('This seed command is for the local development database only.')
  }
  const universities = new Map(getAllUniversities().map(uni => [uni.id, uni]))
  for (const university of universities.values()) {
    const data = {
      name: university.name, level: university.level,
      location: university.location, province: university.province,
      city: university.city, description: university.description,
      logoUrl: university.logoUrl,
    }
    await prisma.university.upsert({
      where: { id: university.id },
      create: { id: university.id, ...data }, update: data,
    })
  }
  const uniqueMajors = new Map(majors.map(major => [major.id, major]))
  for (const major of uniqueMajors.values()) {
    const data = {
      name: major.name, category: major.category,
      description: major.description, hotScore: major.hotScore,
      strongUniversities: major.strongUniversities,
    }
    await prisma.major.upsert({
      where: { id: major.id },
      create: { id: major.id, ...data }, update: data,
    })
  }
  console.log(`Local database ready: ${universities.size} universities, ${uniqueMajors.size} majors.`)
}

main()
  .catch(error => { console.error(error); process.exitCode = 1 })
  .finally(() => prisma.$disconnect())
