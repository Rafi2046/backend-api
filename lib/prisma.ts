import { PrismaClient } from "@prisma/client";

// Interview Concept: Singleton Pattern in Next.js
// Next.js development e code save korle bar bar reload (HMR) hoy.
// Prottek re-render e jeno notun Database connection na create hoy,
// tai globalThis e prisma instance save kore rakha hoy.

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

