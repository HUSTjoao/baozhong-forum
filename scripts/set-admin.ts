import 'dotenv/config'
import { prisma } from '../lib/prisma'

// Only a trusted server operator can grant a role. There is no browser promotion API.
async function main() {
  const username = process.argv[2]?.trim()
  if (!username) throw Error('用法：npx tsx scripts/set-admin.ts 注册账号 --apply（不需要密码）')
  const user = await prisma.user.findUnique({ where: { username }, select: { id: true, username: true, role: true } })
  if (!user) throw Error('该账号不存在，请先在当前网站注册。')
  if (!process.argv.includes('--apply')) {
    console.log(`将把账号 ${user.username} 设为管理员。确认账号后加 --apply 执行。`)
    return
  }
  await prisma.user.update({ where: { id: user.id }, data: { role: 'admin', isMuted: false } })
  console.log('已设置管理员。请退出登录后重新登录，再访问 /admin。')
}
main().catch(error => { console.error(error instanceof Error ? error.message : '操作失败'); process.exitCode = 1 }).finally(() => prisma.$disconnect())
