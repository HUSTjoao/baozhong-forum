import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get('q')?.trim() || ''
  if (!query || query.length > 80) return NextResponse.json({ results: [] })
  try {
    const [universities, majors] = await Promise.all([
      prisma.university.findMany({ where: { name: { contains: query }, isApproved: true }, select: { id: true, name: true }, take: 6, orderBy: { name: 'asc' } }),
      prisma.major.findMany({ where: { name: { contains: query }, isApproved: true }, select: { id: true, name: true }, take: 6, orderBy: { name: 'asc' } }),
    ])
    return NextResponse.json({ results: [
      ...universities.map(item => ({ ...item, type: '大学', href: `/universities/${item.id}` })),
      ...majors.map(item => ({ ...item, type: '专业', href: `/majors/${item.id}/forum` })),
    ] })
  } catch {
    return NextResponse.json({ error: '搜索暂时不可用，请稍后重试。' }, { status: 500 })
  }
}
