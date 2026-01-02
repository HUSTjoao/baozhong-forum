import { prisma } from '@/lib/prisma'
import Link from 'next/link'

export default async function UniversitiesPage() {
  const universities = await prisma.university.findMany({
    include: {
      _count: {
        select: { 
          questions: true // 修正点：这里只统计 questions，不要写 users
        }
      }
    },
    orderBy: { name: 'asc' }
  })

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6 text-slate-900">大学列表</h1>
      <div className="grid gap-4">
        {universities.map((uni) => (
          <Link key={uni.id} href={`/universities/${uni.id}/forum`} className="p-4 border rounded-xl hover:bg-gray-50">
            <h2 className="font-bold text-slate-800">{uni.name}</h2>
            <p className="text-sm text-gray-500">已有 {uni._count.questions} 条帖子</p>
          </Link>
        ))}
      </div>
    </div>
  )
}