import { PrismaClient, User } from "@prisma/client"
import {
  ForbiddenException,
  UnauthorizedException,
} from "./server/HttpException"
import { NextIronRequest } from "./server/session"

export async function requireAuthentication(
  req: NextIronRequest,
  prisma: PrismaClient
) {
  const sessionUser: User | null | undefined = req.session.get("user")

  if (sessionUser !== null && sessionUser !== undefined) {
    const user = await prisma.user.findUnique({
      where: { id: sessionUser.id },
    })
    if (user === null) {
      throw new UnauthorizedException()
    } else {
      return user
    }
  } else {
    throw new UnauthorizedException()
  }
}

export async function requireAdminAuthentication(
  req: NextIronRequest,
  prisma: PrismaClient,
  organizationId: number
) {
  const user = await requireAuthentication(req, prisma)
  const admin = await prisma.usersOnOrganizations.findFirst({
    where: { isAdmin: true, userId: user.id, organizationId },
  })
  if (admin === null) {
    throw new ForbiddenException()
  }
  return user
}
