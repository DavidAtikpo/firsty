import { PrismaClient } from "@prisma/client"

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

const databaseUrl =
  process.env.DATABASE_URL ||
  process.env.NEON_DATABASE_URL ||
  process.env.NEON_POSTGRES_PRISMA_URL ||
  process.env.SUPABASE_POSTGRES_URL ||
  // Use a placeholder for development if no URL is set (will fail at runtime but allows build)
  (process.env.NODE_ENV !== "production" ? "postgresql://placeholder:placeholder@localhost:5432/placeholder" : undefined)

if (!databaseUrl) {
  throw new Error(
    "ERROR: No database URL found. Please set DATABASE_URL, NEON_POSTGRES_PRISMA_URL, or NEON_DATABASE_URL",
  )
}

      if (databaseUrl.includes("placeholder")) {
        console.warn(
          "WARNING: Using placeholder database URL. Please set DATABASE_URL in .env.local to use database features.",
        )
      }

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasources: {
      db: {
        url: databaseUrl,
      },
    },
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  })

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma
}
