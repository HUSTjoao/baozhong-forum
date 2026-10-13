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
 const text=(key:string,max:number,required=false)=>{const value=typeof body[key]==='string'?(body[key] as string).trim():'';if((required&&!value)||value.length>max)throw Error(`请检查${key==='name'?'名称':key==='description'?'介绍':key==='province'?'省份':key==='city'?'城市':key}的填写长度。`);return value}
 const name=text('name',80,true),description=text('description',6000,true)
 if(description.length<30)throw Error('请填写至少 30 字的介绍，方便核实信息。')
 const category=text('category',20),province=text('province',40,kind==='universities'),city=text('city',40,kind==='universities')
 const website=text('website',500),englishName=text('englishName',160),motto=text('motto',200)
 if(website){try{if(new URL(website).protocol!=='https:')throw Error()}catch{throw Error('官网链接请使用完整的 https:// 地址。')}}
 if(kind==='majors'&&!categories.includes(category as typeof categories[number]))throw Error('请选择正确的学科类别。')
 const base=kind==='universities'?universities:majors
 if(base.some(item=>normalizedName(item.name)===normalizedName(name)))throw Error('这个名称已经收录，请先在列表中搜索。')
 const id=`user-${kind}-${createHash('sha256').update(normalizedName(name)).digest('hex').slice(0,24)}`
 return prisma.$transaction(async tx=>{
  const existing=kind==='universities'?await tx.university.findMany({select:{name:true}}):await tx.major.findMany({select:{name:true}})
  if(existing.some(item=>normalizedName(item.name)===normalizedName(name)))throw Error('这个名称已收录或已有待审核申请，请勿重复提交。')
  const review={id,name,isUserAdded:true,isApproved:false,reviewStatus:'pending',creatorId:userId}
  if(kind==='majors')return tx.major.create({data:{...review,category,description,strongUniversities:[]}})
  return tx.university.create({data:{...review,description,province,city,location:province===city?city:province+city,level:text('level',40)||'其他',profile:{create:{englishName,motto,introduction:description,website,sourceUrl:website,accent:'cyan'}}}})
 })
}
