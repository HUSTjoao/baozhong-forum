import 'dotenv/config'
import { getAllUniversities } from '../data/universities'
import { majors } from '../data/majors'
import reviewed from '../data/campus-profiles-reviewed.json'
import { campusTheme } from '../lib/campus-themes'
const catalog=getAllUniversities()
function validate(){
 for(const [label,items] of [['大学',catalog],['专业',majors]] as const){
  if(new Set(items.map(item=>item.id)).size!==items.length)throw Error(`${label} ID 重复`)
  if(new Set(items.map(item=>item.name)).size!==items.length)throw Error(`${label}名称重复`)
 }
 if(catalog.some(item=>!reviewed.some(profile=>profile.id===item.id&&profile.introduction.trim())))throw Error('部分大学缺少核实过的介绍')
 if(majors.some(item=>!item.description.trim()))throw Error('部分专业缺少介绍')
}
async function main(){
 validate()
 if(process.argv.includes('--check')){console.log(`资料检查通过：${catalog.length} 所大学、${majors.length} 个专业。不写数据库。`);return}
 if(process.env.DATABASE_PROVIDER!=='postgresql'||!process.env.DATABASE_URL)throw Error('仅用于已配置好的 PostgreSQL 数据库')
 const {prisma}=await import('../lib/prisma')
 try{
  const region=(value?:string)=>(value||'').replace(/(省|市)$/,'').replace('壮族自治区','').replace('回族自治区','').replace('维吾尔自治区','').replace('自治区','')
  for(const entry of catalog){
   const profile=reviewed.find(item=>item.id===entry.id)!
   const university={name:entry.name,level:profile.level,location:entry.location,province:region(entry.province),city:region(entry.city),description:profile.introduction,logoUrl:entry.logoUrl||null,isApproved:true,reviewStatus:'approved'}
   const detail={englishName:profile.englishName,motto:profile.motto,introduction:profile.introduction,website:profile.website,sourceUrl:profile.sourceUrl,accent:campusTheme(entry.id,profile.accent).key}
   await prisma.$transaction(async tx=>{
    const existing=await tx.university.findUnique({where:{id:entry.id},select:{isUserAdded:true}})
    if(existing?.isUserAdded)throw Error('预置大学 ID 与用户资料冲突，已停止导入')
    await tx.university.upsert({where:{id:entry.id},create:{id:entry.id,...university},update:university})
    await tx.universityProfile.upsert({where:{id:entry.id},create:{id:entry.id,...detail},update:detail})
   })
  }
  for(const entry of majors){
   const existing=await prisma.major.findUnique({where:{id:entry.id},select:{isUserAdded:true}})
   if(existing?.isUserAdded)throw Error('预置专业 ID 与用户资料冲突，已停止导入')
   const values={name:entry.name,category:entry.category,description:entry.description,strongUniversities:entry.strongUniversities,isApproved:true,reviewStatus:'approved'}
   await prisma.major.upsert({where:{id:entry.id},create:{id:entry.id,...values,hotScore:entry.hotScore},update:values})
  }
  console.log(`已导入 ${catalog.length} 所大学、${majors.length} 个专业。没有创建测试账号、帖子或寄语。`)
 }finally{await prisma.$disconnect()}
}
void main().catch(()=>{console.error('资料初始化失败，请核对资料、数据库配置和已应用的迁移。');process.exitCode=1})
