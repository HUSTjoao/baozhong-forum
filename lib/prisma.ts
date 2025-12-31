import { PrismaClient } from '@prisma/client'

// 避免在开发模式下热重载导致 PrismaClient 多次实例化
const globalForPrisma = global as unknown as { prisma?: PrismaClient }

const createPrismaClient = () => {
  return new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
    // 明确指定使用默认的 binary engine（不是 client engine）
    // 这样可以避免需要 adapter 或 accelerateUrl
  })
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}


