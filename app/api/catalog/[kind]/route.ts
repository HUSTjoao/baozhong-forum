import { NextRequest,NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authOptions'
import { prisma } from '@/lib/prisma'
import { approvedMajors,kindOf,submitCatalog } from '@/lib/catalog-server'
export const dynamic='force-dynamic'
const headers={'Cache-Control':'no-store'}
export async function GET(_request:NextRequest,{ params: routeParams }:{params: Promise<{kind:string}>}) {
  const params = await routeParams
 const kind=kindOf(params.kind);if(!kind)return NextResponse.json({error:'类别不存在'},{status:404})
 try{return NextResponse.json(kind==='majors'?await approvedMajors():await prisma.university.findMany({where:{isApproved:true},select:{id:true,name:true,province:true,city:true,level:true}}),{headers})}catch{return NextResponse.json({error:'目录暂时无法加载'},{status:500,headers})}
}
export async function POST(request:NextRequest,{ params: routeParams }:{params: Promise<{kind:string}>}) {
  const params = await routeParams
 const kind=kindOf(params.kind);if(!kind)return NextResponse.json({error:'类别不存在'},{status:404})
 const session=await getServerSession(authOptions)
 if(!session?.user?.id)return NextResponse.json({error:'请先登录后提交。'},{status:401})
 try{
  const user=await prisma.user.findUnique({where:{id:session.user.id},select:{isMuted:true}})
  if(!user||user.isMuted)return NextResponse.json({error:'当前账号暂时无法提交资料。'},{status:403})
  if(Number(request.headers.get('content-length')||0)>24000)return NextResponse.json({error:'提交内容过长'},{status:413})
  const body=await request.json();if(!body||typeof body!=='object'||Array.isArray(body))return NextResponse.json({error:'提交格式不正确'},{status:400})
  const result=await submitCatalog(kind,body,session.user.id)
  return NextResponse.json({id:result.id,name:result.name,status:'pending'},{status:201,headers})
 }catch(error){return NextResponse.json({error:error instanceof Error&& !('code' in error)?error.message:'名称重复或暂时无法提交，请稍后重试。'},{status:400,headers})}
}
