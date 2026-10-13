import 'dotenv/config'
import bcrypt from 'bcryptjs'
import { randomUUID } from 'node:crypto'
import { prisma } from '../lib/prisma'

async function main() {
  const username = process.argv[2]?.trim()
  if (!username || username.length > 60) throw Error('请提供有效的注册账号名。')
  if (!process.argv.includes('--apply')) {
    console.log('此命令将创建或更新指定管理员账号。确认后加 --apply，并从标准输入提供密码。')
    return
  }
  if (process.stdin.isTTY) throw Error('请通过隐藏输入方式提供密码，不要把密码写进命令参数。')
  let password = ''
  for await (const chunk of process.stdin) {
    password += chunk.toString()
    if (password.length > 256) throw Error('密码过长，操作停止。')
  }
  password = password.replace(/\r?\n$/, '')
  if (password.length < 8 || Buffer.byteLength(password, 'utf8') > 72) throw Error('密码须至少 8 个字符，且不超过 72 个 UTF-8 字节。')
  const hash = await bcrypt.hash(password, 12)
  password = ''
  await prisma.user.upsert({
    where: { username },
    create: { username, email: `admin-${randomUUID()}@example.invalid`, password: hash, nickname: '管理员', role: 'admin', isMuted: false },
    update: { password: hash, role: 'admin', isMuted: false },
    select: { id: true },
  })
  console.log('管理员账号配置成功。请在普通登录页登录，将自动进入后台。')
}
main().catch(error => { console.error(error instanceof Error && !('code' in error) ? error.message : '配置失败，请检查当前数据库连接。'); process.exitCode = 1 }).finally(() => prisma.$disconnect())
