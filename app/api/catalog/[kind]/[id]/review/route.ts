import { NextRequest,NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin-access'
import { completeCatalog,kindOf } from '@/lib/catalog-server'
export const dynamic='force-dynamic'
export async function PATCH(request:NextRequest,{params}:{params:{kind:string;id:string}}){
 try {
  const access=await requireAdmin();if(access.error)return access.error
  const kind=kindOf(params.kind);if(!kind)return NextResponse.json({error:'类别不存在'},{status:404})
  const body=await request.json().catch(()=>null);if(!body||typeof body!=='object'||Array.isArray(body))return NextResponse.json({error:'资料格式不正确'},{status:400})
  const result=await completeCatalog(kind,params.id,body)
  if(!result?.count)return NextResponse.json({error:'申请不存在或已完成处理，请刷新列表'},{status:409})
  return NextResponse.json({status:body.status},{headers:{'Cache-Control':'no-store'}})
 }catch(error){return NextResponse.json({error:error instanceof Error&&!('code' in error)?error.message:'保存失败，请稍后重试'},{status:400})}
}
