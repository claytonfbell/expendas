// https://github.com/prisma/prisma/issues/1983#issuecomment-620621213
import { PrismaClient } from "@prisma/client"

let prisma: PrismaClient

if (process.env.NODE_ENV === "production") {
  prisma = new PrismaClient()
} else {
  // @ts-ignore
  if (!global.prisma) {
    // @ts-ignore
    global.prisma = new PrismaClient()
  }

  // @ts-ignore
  prisma = global.prisma
}

export default prisma
