import { PrismaClient } from '@prisma/client'

// 避免在开发模式下热重载导致 PrismaClient 多次实例化
const globalForPrisma = global as unknown as { prisma?: PrismaClient }

const createPrismaClient = () => {
  // Prisma 7.x 默认使用 binary engine，不需要额外配置
  // 如果遇到 engine type "client" 错误，可能是生成的客户端有问题
  return new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  })
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}


