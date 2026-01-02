import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authOptions'

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) return NextResponse.json({ error: '未登录' }, { status: 401 })

    const data = await req.json()
    
    // 用 (prisma.question as any) 强制绕过本地类型不同步的问题
    const question = await (prisma.question as any).create({
      data: {
        title: data.title,
        content: data.content,
        universityId: data.universityId,
        askerName: session.user.name || '校友',
        isAnonymous: Boolean(data.isAnonymous),
        likes: 0
      }
    })

    return NextResponse.json(question)
  } catch (error) {
    console.error('Post Error:', error)
    return NextResponse.json({ error: '发布失败' }, { status: 500 })
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const universityId = searchParams.get('universityId')
    
    const questions = await prisma.question.findMany({
      where: universityId ? { universityId } : {},
      orderBy: { date: 'desc' }
    })
    
    return NextResponse.json({ questions })
  } catch (error) {
    return NextResponse.json({ questions: [] }, { status: 500 })
  }
}