import { NextRequest,NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authOptions'
import { prisma } from '@/lib/prisma'
import { kindOf } from '@/lib/catalog-server'
export const dynamic='force-dynamic'
export async function PATCH(request:NextRequest,{params}:{params:{kind:string;id:string}}){
 const session=await getServerSession(authOptions);if(!session?.user?.id)return NextResponse.json({error:'请先登录'},{status:401})
 const user=await prisma.user.findUnique({where:{id:session.user.id},select:{role:true}})
 if(user?.role!=='admin')return NextResponse.json({error:'仅管理员可审核'},{status:403})
 const kind=kindOf(params.kind);if(!kind)return NextResponse.json({error:'类别不存在'},{status:404})
 try{const body=await request.json();if(!['approved','rejected'].includes(body.status))return NextResponse.json({error:'审核状态不正确'},{status:400})
  const where={id:params.id,isUserAdded:true,reviewStatus:'pending'}
  const data={isApproved:body.status==='approved',reviewStatus:body.status}
  const result=kind==='universities'?await prisma.university.updateMany({where,data}):await prisma.major.updateMany({where,data})
  if(!result.count)return NextResponse.json({error:'申请不存在或已完成审核，请刷新列表'},{status:409})
  return NextResponse.json({status:body.status})
 }catch{return NextResponse.json({error:'审核失败，请稍后重试'},{status:500})}
}
