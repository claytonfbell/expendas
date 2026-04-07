import { PrismaPg } from "@prisma/adapter-pg"
import { PrismaClient } from "@prisma/client"
import { Pool } from "pg"

let prisma: PrismaClient

// declare global to prevent multiple instances of Prisma Client in development
declare global {
  var prisma: PrismaClient | undefined
}

const connectionString = `${process.env.DATABASE_URL}`
const pool = new Pool({ connectionString })

// 2. Initialize the adapter
const adapter = new PrismaPg(pool)

if (process.env.NODE_ENV === "production") {
  prisma = new PrismaClient({ adapter })
} else {
  if (!global.prisma) {
    // 3. Pass the adapter to PrismaClient
    global.prisma = new PrismaClient({ adapter })
  }
  prisma = global.prisma
}

export default prisma
