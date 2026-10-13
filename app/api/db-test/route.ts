import { NextResponse } from 'next/server'
export const dynamic='force-dynamic'
export const runtime='nodejs'
export async function GET(){
 try{const {prisma}=await import('@/lib/prisma');await prisma.$queryRaw`SELECT 1`;await prisma.$transaction([prisma.user.count(),prisma.university.count(),prisma.major.count(),prisma.question.count(),prisma.reply.count(),prisma.alumniMessage.count()]);return NextResponse.json({ok:true},{headers:{'Cache-Control':'no-store'}})}
 catch{return NextResponse.json({ok:false,error:'数据库连接或表结构检查失败'},{status:503,headers:{'Cache-Control':'no-store'}})}
}

