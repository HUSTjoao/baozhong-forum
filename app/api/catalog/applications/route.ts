import { NextRequest,NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authOptions'
import { prisma } from '@/lib/prisma'
export const dynamic='force-dynamic'
export async function GET(request:NextRequest){
 const session=await getServerSession(authOptions);if(!session?.user?.id)return NextResponse.json({error:'请先登录'},{status:401})
 const user=await prisma.user.findUnique({where:{id:session.user.id},select:{role:true}})
 const all=request.nextUrl.searchParams.get('scope')==='admin'
 if(all&&user?.role!=='admin')return NextResponse.json({error:'仅管理员可查看全部申请'},{status:403})
 const where={isUserAdded:true,...(!all&&{creatorId:session.user.id})}
 const [universities,majors]=await Promise.all([prisma.university.findMany({where,include:{profile:true},orderBy:{createdAt:'desc'}}),prisma.major.findMany({where,orderBy:{createdAt:'desc'}})])
 return NextResponse.json([...universities.map(u=>({id:u.id,kind:'universities',name:u.name,description:u.description,category:u.location,website:u.profile?.website,status:u.reviewStatus||'pending',createdAt:u.createdAt})),...majors.map(m=>({id:m.id,kind:'majors',name:m.name,description:m.description,category:m.category,status:m.reviewStatus||'pending',createdAt:m.createdAt}))].sort((a,b)=>b.createdAt.getTime()-a.createdAt.getTime()),{headers:{'Cache-Control':'private, no-store'}})
}
