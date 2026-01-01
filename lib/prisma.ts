// lib/prisma.ts
import { PrismaClient } from '@prisma/client'

const globalForPrisma = global as unknown as { prisma: PrismaClient }

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    // 关键点：手动从环境变量读取连接串，解决 Prisma 7 不允许在 schema 中定义 env 的限制
    datasourceUrl: process.env.DATABASE_URL, 
    log: ['query', 'error', 'warn'],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma