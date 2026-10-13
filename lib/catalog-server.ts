import { createHash } from 'node:crypto'
import { prisma } from '@/lib/prisma'
import { majors, type Major } from '@/data/majors'
import { universities } from '@/data/universities'

export const categories = ['arts','science','engineering','medicine','other'] as const
export type CatalogKind = 'universities' | 'majors'
export const normalizedName = (name: string) => name.normalize('NFKC').replace(/\s+/g,'').toLowerCase()
export function kindOf(value: string): CatalogKind | null { return value === 'universities' || value === 'majors' ? value : null }
export function majorView(item: {id:string;name:string;category:string;description:string;hotScore:number;strongUniversities:unknown;isApproved:boolean|null;isUserAdded:boolean;reviewStatus:string|null;creatorId:string|null}): Major {
 return {...item,category:item.category as Major['category'],strongUniversities:Array.isArray(item.strongUniversities)?item.strongUniversities as string[]:[],isApproved:item.isApproved===true,reviewStatus:item.reviewStatus as Major['reviewStatus'],creatorId:item.creatorId || undefined}
}
export async function approvedMajors() {
 const additions=await prisma.major.findMany({where:{isUserAdded:true,isApproved:true,reviewStatus:'approved'},orderBy:{createdAt:'asc'}})
 return [...majors,...additions.filter(item=>!majors.some(m=>normalizedName(m.name)===normalizedName(item.name))).map(majorView)]
}
export async function submitCatalog(kind: CatalogKind, body: Record<string,unknown>, userId: string) {
 const name=typeof body.name==='string'?body.name.trim():''
 if(!name||name.length>80)throw Error('请填写名称，最多 80 个字。')
 // Suggestions carry only a name; descriptive metadata is curated by an administrator.
 const description='',category='other',province='',city='',website='',englishName='',motto=''
 const base=kind==='universities'?universities:majors
 if(base.some(item=>normalizedName(item.name)===normalizedName(name)))throw Error('这个名称已经收录，请先在列表中搜索。')
 const id=`user-${kind}-${createHash('sha256').update(normalizedName(name)).digest('hex').slice(0,24)}`
 return prisma.$transaction(async tx=>{
  const existing=kind==='universities'?await tx.university.findMany({select:{name:true}}):await tx.major.findMany({select:{name:true}})
  if(existing.some(item=>normalizedName(item.name)===normalizedName(name)))throw Error('这个名称已收录或已有待审核申请，请勿重复提交。')
  const review={id,name,isUserAdded:true,isApproved:false,reviewStatus:'pending',creatorId:userId}
  if(kind==='majors')return tx.major.create({data:{...review,category,description,strongUniversities:[]}})
  return tx.university.create({data:{...review,description,province,city,location:'',level:'其他',profile:{create:{englishName,motto,introduction:description,website,sourceUrl:website,accent:'cyan'}}}})
 })
}

export async function completeCatalog(kind:CatalogKind,id:string,body:Record<string,unknown>) {
 const status=body.status
 if(!['pending','approved','rejected'].includes(String(status)))throw Error('请选择有效的处理方式。')
 return prisma.$transaction(async tx=>{
  const existing=kind==='universities'?await tx.university.findFirst({where:{id,isUserAdded:true,reviewStatus:'pending'},include:{profile:true}}):await tx.major.findFirst({where:{id,isUserAdded:true,reviewStatus:'pending'}})
  if(!existing)return null
  if(status==='rejected') {
   const where={id,isUserAdded:true,reviewStatus:'pending'},data={isApproved:false,reviewStatus:'rejected'}
   return kind==='universities'?tx.university.updateMany({where,data}):tx.major.updateMany({where,data})
  }
  const field=(key:string,current:string|null|undefined,max:number)=>{if(body[key]!==undefined&&typeof body[key]!=='string')throw Error('资料格式不正确。');const value=body[key]===undefined?current||'':String(body[key]).trim();if(value.length>max)throw Error('资料过长，请精简后保存。');return value}
  const name=field('name',existing.name,80),description=field('description',existing.description,6000)
  if(!name)throw Error('请填写正式名称。')
  if(status==='approved'&&description.length<30)throw Error('请先补充至少 30 字的介绍，再公开资料。')
  const base=kind==='universities'?universities:majors
  const peers=kind==='universities'?await tx.university.findMany({where:{id:{not:id}},select:{name:true}}):await tx.major.findMany({where:{id:{not:id}},select:{name:true}})
  if([...base,...peers].some(item=>normalizedName(item.name)===normalizedName(name)))throw Error('这个名称已收录或已有另一份申请，请核对后处理。')
  const common={name,description,isApproved:status==='approved',reviewStatus:String(status)}
  if(kind==='majors'){
   const category=field('category','category' in existing?existing.category:'other',20)
   if(!categories.includes(category as typeof categories[number]))throw Error('请选择所属学科。')
   return tx.major.updateMany({where:{id,isUserAdded:true,reviewStatus:'pending'},data:{...common,category}})
  }
  const university=existing as Awaited<ReturnType<typeof tx.university.findFirst>> & {profile?:{website:string;englishName:string;motto:string;sourceUrl:string}|null}
  const province=field('province',university?.province,40),city=field('city',university?.city,40),level=field('level',university?.level,40)||'其他'
  if(status==='approved'&&(!province||!city))throw Error('请先补全省份和城市，再公开学校。')
  const website=field('website',university?.profile?.website,500),sourceUrl=field('sourceUrl',university?.profile?.sourceUrl,500)
  for(const url of [website,sourceUrl])if(url){try{if(new URL(url).protocol!=='https:')throw Error()}catch{throw Error('官网和来源链接请使用完整 https:// 地址。')}}
  const englishName=field('englishName',university?.profile?.englishName,160),motto=field('motto',university?.profile?.motto,200)
  const result=await tx.university.updateMany({where:{id,isUserAdded:true,reviewStatus:'pending'},data:{...common,province,city,level,location:province===city?city:province+city}})
  if(result.count)await tx.universityProfile.upsert({where:{id},create:{id,englishName,motto,website,sourceUrl,introduction:description,accent:'cyan'},update:{englishName,motto,website,sourceUrl,introduction:description}})
  return result
 })
}
