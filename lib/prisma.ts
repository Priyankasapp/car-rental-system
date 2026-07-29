import { PrismaClient, Prisma } from '@prisma/client'

// Safely define global type for Prisma singleton (prevents multiple instances in Next.js dev server)
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Create a singleton instance with query logging events
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

// Attach clean event logging during development
if (process.env.NODE_ENV === 'development') {
  prisma.$on('query' as never, (e: Prisma.QueryEvent) => {
    console.log(' Query:', e.query)
    console.log(' Duration:', `${e.duration}ms`)
  })

  prisma.$on('info' as never, (e: Prisma.LogEvent) => {
    console.log('ℹ Prisma Info:', e.message)
  })

  prisma.$on('warn' as never, (e: Prisma.LogEvent) => {
    console.log(' Prisma Warning:', e.message)
  })

  prisma.$on('error' as never, (e: Prisma.LogEvent) => {
    console.log(' Prisma Error:', e.message)
  })
}

// Store singleton in global scope during development hot-reloading
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}

// Optional cleanup helper
export async function disconnectPrisma() {
  await prisma.$disconnect()
}

export default prisma