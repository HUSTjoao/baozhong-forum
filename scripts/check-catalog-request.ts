import 'dotenv/config'
import assert from 'node:assert/strict'
import { randomUUID } from 'node:crypto'
import { encode } from 'next-auth/jwt'
import { prisma } from '../lib/prisma'

async function main() {
 if(process.env.DATABASE_PROVIDER==='postgresql')throw Error('仅允许在本地 SQLite 测试。')
 const tag='catalog-qa-'+randomUUID(),admin=tag+'-admin',user=tag+'-user',universityName=tag+'大学',majorName=tag+'专业'
 const cookie=async(id:string,role:string)=>'next-auth.session-token='+await encode({secret:process.env.NEXTAUTH_SECRET||'your-secret-key-change-in-production',token:{id,sub:id,role}})
 const adminCookie=await cookie(admin,'admin'),userCookie=await cookie(user,'student')
 async function call(path:string,auth:string,method='GET',body?:unknown){const r=await fetch('http://127.0.0.1:3000'+path,{method,headers:{Cookie:auth,'Content-Type':'application/json'},body:body?JSON.stringify(body):undefined});return {status:r.status,body:await r.json()}}
 try {
  await prisma.user.create({data:{id:admin,email:admin+'@example.invalid',password:'qa-only',role:'admin'}})
  await prisma.user.create({data:{id:user,email:user+'@example.invalid',password:'qa-only',role:'student'}})
  assert.equal((await call('/api/catalog/universities','', 'POST',{name:universityName})).status,401)
  const uni=await call('/api/catalog/universities',userCookie,'POST',{name:universityName,isApproved:true,description:'forged',creatorId:admin})
  assert.equal(uni.status,201)
  const id=uni.body.id
  const saved=await prisma.university.findUniqueOrThrow({where:{id}})
  assert.equal(saved.creatorId,user);assert.equal(saved.description,'');assert.equal(saved.isApproved,false)
  assert.equal((await call('/api/catalog/universities',userCookie,'POST',{name:' '+universityName+' '})).status,400)
  const review='/api/catalog/universities/'+id+'/review'
  assert.equal((await call(review,userCookie,'PATCH',{status:'approved'})).status,403)
  assert.equal((await call(review,adminCookie,'PATCH',{status:'approved'})).status,400)
  assert.equal((await call(review,adminCookie,'PATCH',{status:'pending',description:'整理中的短介绍'})).status,200)
  assert.equal((await prisma.university.findUniqueOrThrow({where:{id}})).isApproved,false)
  const intro='这是一项用于验证申请整理流程的介绍。信息经过核实后由管理员补全并公开展示。'
  assert.equal((await call(review,adminCookie,'PATCH',{status:'approved',description:intro})).status,400)
  assert.equal((await call(review,adminCookie,'PATCH',{status:'approved',description:intro,province:'陕西省',city:'西安市',website:'javascript:bad'})).status,400)
  assert.equal((await call(review,adminCookie,'PATCH',{status:'approved',description:intro,province:'陕西省',city:'西安市',website:'https://example.org',englishName:'QA University',motto:'求真'})).status,200)
  const profile=await prisma.universityProfile.findUniqueOrThrow({where:{id}})
  assert.equal(profile.introduction,intro);assert.equal(profile.motto,'求真')
  assert.ok((await call('/api/catalog/universities',userCookie)).body.some((item:{id:string})=>item.id===id))
  assert.equal((await call(review,adminCookie,'PATCH',{status:'approved'})).status,409)
  const major=await call('/api/catalog/majors',userCookie,'POST',{name:majorName,category:'medicine',description:'forged'})
  assert.equal(major.status,201)
  assert.equal((await prisma.major.findUniqueOrThrow({where:{id:major.body.id}})).category,'other')
  const majorReview='/api/catalog/majors/'+major.body.id+'/review'
  assert.equal((await call(majorReview,adminCookie,'PATCH',{status:'approved',category:'invalid',description:intro})).status,400)
  assert.equal((await call(majorReview,adminCookie,'PATCH',{status:'approved',category:'engineering',description:intro})).status,200)
  assert.ok((await call('/api/catalog/majors',userCookie)).body.some((item:{id:string})=>item.id===major.body.id))
  console.log('PASS: 名称申请、登录/权限、重复名称、资料由管理员补全、保存草稿、未补全禁止发布、学校资料同步及公开目录。')
 } finally {
  const unis=await prisma.university.findMany({where:{creatorId:{in:[user,admin]}} ,select:{id:true}})
  await prisma.universityProfile.deleteMany({where:{id:{in:unis.map(u=>u.id)}}})
  await prisma.university.deleteMany({where:{creatorId:{in:[user,admin]}}})
  await prisma.major.deleteMany({where:{creatorId:{in:[user,admin]}}})
  await prisma.user.deleteMany({where:{id:{in:[user,admin]}}})
 }
}
main().catch(error=>{console.error(error);process.exitCode=1}).finally(()=>prisma.$disconnect())
