import { PrismaClient } from "@prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3"
import { resolve } from "node:path"

// 1. 完善全局类型声明，彻底消除 TS 对 global 的报错
const globalForPrisma = global as unknown as {
  prisma: PrismaClient | undefined
}

// 2. 初始化连接池
function createClient() {
  if (process.env.DATABASE_PROVIDER === 'postgresql' && !process.env.DATABASE_URL) {
    throw new Error('PostgreSQL 已启用，但 DATABASE_URL 尚未配置。')
  }
  const adapter = process.env.DATABASE_PROVIDER === 'postgresql'
    ? new PrismaPg({ connectionString: process.env.DATABASE_URL, connectionTimeoutMillis: 10000, max: 10 })
    : new PrismaBetterSqlite3({
        url: `file:${resolve('prisma/dev.db').replace(/\\/g, '/')}`,
      })
  return new PrismaClient({ adapter, log: ['error', 'warn'] })
}

// 3. 实例化 Prisma，并支持适配器
export const prisma =
  globalForPrisma.prisma ??
  createClient()

// 4. 在非生产环境下将实例挂载到全局，避免重复创建连接
if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma
}
