import { PrismaClient, User } from "@prisma/client"
import {
  ForbiddenException,
  UnauthorizedException,
} from "./server/HttpException"
import { SessionData } from "./server/session"

export async function requireAuthentication(
  session: SessionData,
  prisma: PrismaClient
) {
  const sessionUser: User | null | undefined = session.user

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
  session: SessionData,
  prisma: PrismaClient,
  organizationId: number
) {
  const user = await requireAuthentication(session, prisma)
  const admin = await prisma.usersOnOrganizations.findFirst({
    where: { isAdmin: true, userId: user.id, organizationId },
  })
  if (admin === null) {
    throw new ForbiddenException()
  }
  return user
}

export async function requireOrganizationAuthentication(
  session: SessionData,
  prisma: PrismaClient,
  organizationId: number
) {
  const user = await requireAuthentication(session, prisma)
  const userOnOrganization = await prisma.usersOnOrganizations.findFirst({
    where: { userId: user.id, organizationId },
  })
  if (userOnOrganization === null) {
    throw new ForbiddenException()
  }
  return user
}
