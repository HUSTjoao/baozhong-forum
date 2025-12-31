import { PrismaClient } from '@prisma/client'

// 避免在开发模式下热重载导致 PrismaClient 多次实例化
const globalForPrisma = global as unknown as { prisma?: PrismaClient }

const createPrismaClient = () => {
  return new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  })
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}


