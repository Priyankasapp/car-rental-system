// lib/prisma.ts
import { PrismaClient, Prisma } from '@prisma/client'

// Define the global type safely
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Create a singleton instance with proper logging configuration
export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log:
      process.env.NODE_ENV === 'development'
        ? [
            { emit: 'event', level: 'query' },
            { emit: 'event', level: 'info' },
            { emit: 'event', level: 'warn' },
            { emit: 'event', level: 'error' },
          ]
        : [{ emit: 'stdout', level: 'error' }],
  })

// In development, listen to Prisma client events with proper typings
if (process.env.NODE_ENV === 'development') {
  prisma.$on('query' as never, (e: Prisma.QueryEvent) => {
    console.log('🔍 Query:', e.query)
    console.log('⏱️ Duration:', `${e.duration}ms`)
  })

  prisma.$on('info' as never, (e: Prisma.LogEvent) => {
    console.log('ℹ️ Prisma Info:', e.message)
  })

  prisma.$on('warn' as never, (e: Prisma.LogEvent) => {
    console.log('⚠️ Prisma Warning:', e.message)
  })

  prisma.$on('error' as never, (e: Prisma.LogEvent) => {
    console.log('❌ Prisma Error:', e.message)
  })
}

// Save the instance in global for hot reloading
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}

// Optional: Add a disconnect function for cleanup
export async function disconnectPrisma() {
  await prisma.$disconnect()
}

export default prisma