import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import Link from 'next/link'

export default async function UniversityForumPage({ params }: { params: { id: string } }) {
  const university = await prisma.university.findUnique({
    where: { id: params.id }
  })

  if (!university) notFound()

  const questions = await prisma.question.findMany({
    where: { universityId: params.id },
    orderBy: { date: 'desc' }
  })

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6 text-slate-900">{university.name} 讨论区</h1>
      <div className="space-y-4">
        {questions.map((q) => (
          <div key={q.id} className="p-4 border rounded-lg bg-white shadow-sm">
            <h2 className="font-semibold text-slate-800">{q.title}</h2>
            <p className="text-slate-600 my-2">{q.content}</p>
            <div className="text-xs text-slate-400 flex gap-4">
              <span>发布者: {q.isAnonymous ? '匿名用户' : q.askerName}</span>
              <span>{new Date(q.date).toLocaleDateString()}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}