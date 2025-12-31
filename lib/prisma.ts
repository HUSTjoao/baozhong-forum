import { PrismaClient } from '@prisma/client'

// 避免在开发模式下热重载导致 PrismaClient 多次实例化
const globalForPrisma = global as unknown as { prisma?: PrismaClient }

const createPrismaClient = () => {
  // 在构建时使用最小配置，避免连接数据库
  if (process.env.NEXT_PHASE === 'phase-production-build') {
    return new PrismaClient({
      log: [],
      datasources: {
        db: {
          url: process.env.DATABASE_URL || 'postgresql://localhost:5432/dummy',
        },
      },
    })
  }
  
  return new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  })
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}


