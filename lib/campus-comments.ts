import { prisma } from '@/lib/prisma'
export async function getCampusComments(universityId: string, cursor?: string) {
  const [rows, count] = await Promise.all([
    prisma.question.findMany({
      where: { universityId }, orderBy: [{ date: 'desc' }, { id: 'desc' }], take: 20,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
      select: { id: true, content: true, askerName: true, isAnonymous: true, date: true, repliesCount: true,
        replies: { orderBy: { date: 'asc' }, select: { id: true, content: true, replierName: true, isAnonymous: true, date: true } } },
    }),
    prisma.question.count({ where: { universityId } }),
  ])
  return { count, comments: rows.map(q => ({
    id: q.id, content: q.content, name: q.isAnonymous ? '匿名同学' : q.askerName, date: q.date.toISOString(),
    replies: q.replies.map(r => ({ id: r.id, content: r.content, name: r.isAnonymous ? '匿名同学' : r.replierName || '同学', date: r.date.toISOString() })),
  })) }
}
