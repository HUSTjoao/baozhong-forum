import 'dotenv/config'
async function main(){
 if(process.env.DATABASE_PROVIDER!=='postgresql'||!process.env.DATABASE_URL){console.error('FAIL: 尚未配置 PostgreSQL 云数据库；本地 SQLite 不能通过上线检查。');process.exitCode=1;return}
 const {prisma}=await import('../lib/prisma')
 try{await prisma.$queryRaw`SELECT 1`;await prisma.$transaction([prisma.user.count(),prisma.university.count(),prisma.major.count(),prisma.question.count(),prisma.reply.count(),prisma.alumniMessage.count()]);console.log('PASS: PostgreSQL 连接与主要业务表查询成功。还需从部署网址验证真实读写及持久化。')}
 catch{console.error('FAIL: 云数据库连接或业务表检查失败；请核对网络、凭据、生成的客户端与迁移状态。');process.exitCode=1}
 finally{await prisma.$disconnect()}
}
void main().catch(()=>{console.error('FAIL: 数据库初始化失败。');process.exitCode=1})
