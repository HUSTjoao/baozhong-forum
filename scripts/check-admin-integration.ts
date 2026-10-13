import 'dotenv/config'
import assert from 'node:assert/strict'
import { randomUUID } from 'node:crypto'
import { encode } from 'next-auth/jwt'
import { prisma } from '../lib/prisma'

// Run only against the local development server and its SQLite database.
async function main() {
  if (process.env.DATABASE_PROVIDER === 'postgresql') throw Error('此测试只允许本地 SQLite，不会操作服务器数据库。')
  const tag = 'admin-qa-' + randomUUID()
  const admin = tag + '-admin', regular = tag + '-regular', question = tag + '-q', parent = tag + '-r1', child = tag + '-r2', message = tag + '-message'
  const cookie = async (id:string) => 'next-auth.session-token=' + await encode({ secret: process.env.NEXTAUTH_SECRET || 'your-secret-key-change-in-production', token: { id, sub:id, role:'admin', nickname:'QA' } })
  const adminCookie = await cookie(admin), regularCookie = await cookie(regular)
  async function call(path:string, auth:string, method='GET', body?:unknown) {
    const r = await fetch('http://localhost:3000'+path, { method, headers: { Cookie:auth, 'Content-Type':'application/json' }, body:body?JSON.stringify(body):undefined })
    return {status:r.status,body:await r.json()}
  }
  try {
    await prisma.user.create({data:{id:admin,email:admin+'@example.invalid',username:admin,password:'qa-only',role:'admin'}})
    await prisma.user.create({data:{id:regular,email:regular+'@example.invalid',username:regular,password:'qa-only',role:null}})
    await prisma.question.create({data:{id:question,title:tag,content:'QA content',askerId:regular,askerName:'QA'}})
    await prisma.reply.create({data:{id:parent,questionId:question,replierId:regular,content:'QA parent'}})
    await prisma.reply.create({data:{id:child,questionId:question,replierId:regular,parentReplyId:parent,content:'QA child'}})
    await prisma.replyLike.create({data:{replyId:child,userId:regular}})
    await prisma.alumniMessage.create({data:{id:message,userId:regular,content:'QA message'}})
    await prisma.alumniMessageLike.create({data:{messageId:message,userId:regular}})
    assert.equal((await call('/api/admin','')).status,401)
    assert.equal((await call('/api/admin',regularCookie)).status,403,'Forged/stale admin role cannot read management data')
    assert.equal((await call('/api/reports',regularCookie)).status,403)
    const list = await call('/api/admin?kind=users&q='+tag,adminCookie)
    assert.equal(list.status,200);assert.equal(list.body.total,2)
    assert.ok(!JSON.stringify(list.body).includes('qa-only'),'No passwords in management response')
    assert.equal((await call('/api/admin/users/'+regular,regularCookie,'PATCH',{isMuted:true})).status,403)
    assert.equal((await call('/api/admin/users/'+admin,adminCookie,'PATCH',{isMuted:true})).status,403)
    assert.equal((await call('/api/admin/users/'+regular,adminCookie,'PATCH',{isMuted:'yes'})).status,400)
    assert.equal((await call('/api/admin/users/'+regular,adminCookie,'PATCH',{isMuted:true,role:'admin'})).status,200)
    assert.equal((await prisma.user.findUniqueOrThrow({where:{id:regular}})).role,null)
    assert.equal((await call('/api/questions',regularCookie,'POST',{title:'QA title',content:'QA post',category:'校园生活'})).status,403)
    assert.equal((await call('/api/questions/'+question+'/reply',regularCookie,'POST',{content:'QA reply'})).status,403)
    assert.equal((await call('/api/admin/users/'+regular,adminCookie,'PATCH',{isMuted:false})).status,200)
    const report = await call('/api/reports',regularCookie,'POST',{type:'question',targetId:question,questionId:question,reason:'QA reason',targetContent:'forged'})
    assert.equal(report.status,200)
    const saved = await prisma.report.findFirstOrThrow({where:{targetId:question}})
    assert.equal(saved.targetContent,'QA content','Report content is read from database')
    assert.equal((await call('/api/reports/'+saved.id,regularCookie,'PATCH',{status:'resolved'})).status,403)
    assert.equal((await call('/api/reports/'+saved.id,adminCookie,'PATCH',{status:'nonsense'})).status,400)
    assert.equal((await call('/api/reports/'+saved.id,adminCookie,'PATCH',{status:'resolved'})).status,200)
    assert.equal((await call('/api/reports/'+saved.id,adminCookie,'PATCH',{status:'ignored'})).status,409)
    assert.equal((await call('/api/questions/'+question+'/reply/'+parent+'/delete',regularCookie,'POST')).status,200)
    assert.equal(await prisma.reply.count({where:{questionId:question}}),0)
    // The seeded legacy like has a zero counter; removing it must never go negative.
    const unlike = await call('/api/alumni-messages/'+message+'/like',regularCookie,'POST')
    assert.equal(unlike.status,200);assert.equal(unlike.body.message.likes,0);assert.equal(unlike.body.message.likesRel.length,0)
    const like = await call('/api/alumni-messages/'+message+'/like',regularCookie,'POST')
    assert.equal(like.status,200);assert.equal(like.body.message.likes,1);assert.equal(like.body.message.likesRel[0].userId,regular)
    assert.equal((await prisma.alumniMessage.findUniqueOrThrow({where:{id:message}})).likes,1)
    assert.equal((await call('/api/alumni-messages/'+message,adminCookie,'DELETE')).status,200)
    assert.equal(await prisma.alumniMessageLike.count({where:{messageId:message}}),0)
    // Revocation takes effect even though the same JWT still claims admin.
    await prisma.user.update({where:{id:admin},data:{role:'student'}})
    assert.equal((await call('/api/questions/'+question+'/delete',adminCookie,'POST')).status,403)
    await prisma.user.update({where:{id:admin},data:{role:'admin'}})
    assert.equal((await call('/api/questions/'+question+'/delete',adminCookie,'POST')).status,200)
    assert.equal(await prisma.question.count({where:{id:question}}),0)
    console.log('PASS: 管理权限、禁言即时生效、密码隔离、举报处理、回复树删除、寄语关联删除、撤权检查。')
  } finally {
    await prisma.report.deleteMany({where:{questionId:question}})
    await prisma.replyLike.deleteMany({where:{replyId:{in:[parent,child]}}})
    await prisma.reply.deleteMany({where:{id:child}});await prisma.reply.deleteMany({where:{id:parent}})
    await prisma.question.deleteMany({where:{id:question}})
    await prisma.alumniMessage.deleteMany({where:{id:message}})
    await prisma.user.deleteMany({where:{id:{in:[admin,regular]}}})
  }
}
main().catch(error=>{console.error(error);process.exitCode=1}).finally(()=>prisma.$disconnect())
