import { createFileRoute } from "@tanstack/react-router"
import { buildResponse } from "../../components/server/buildResponse"
import { requireAuthentication } from "../../components/requireAuthentication"
import { BadRequestException } from "../../components/server/HttpException"
import prisma from "../../components/server/prisma"
import { v4 as uuidv4 } from "uuid"

export const Route = createFileRoute("/api/api-keys")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        return buildResponse(request, async (session) => {
          const user = await requireAuthentication(session, prisma)
          const keys = await prisma.apiKey.findMany({
            where: { userId: user.id },
            orderBy: { createdAt: "desc" },
            select: { id: true, key: true, createdAt: true },
          })
          return keys
        })
      },
      POST: async ({ request }) => {
        return buildResponse(request, async (session) => {
          const user = await requireAuthentication(session, prisma)
          const key = uuidv4()
          const apiKey = await prisma.apiKey.create({
            data: { key, userId: user.id },
          })
          return { id: apiKey.id, key: apiKey.key, createdAt: apiKey.createdAt }
        })
      },
    },
  },
})