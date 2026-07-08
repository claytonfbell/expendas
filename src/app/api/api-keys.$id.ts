import { createFileRoute } from "@tanstack/react-router"
import { buildResponse } from "../../components/server/buildResponse"
import { requireAuthentication } from "../../components/requireAuthentication"
import { NotFoundException } from "../../components/server/HttpException"
import prisma from "../../components/server/prisma"

export const Route = createFileRoute("/api/api-keys/$id")({
  server: {
    handlers: {
      DELETE: async ({ request, params }) => {
        return buildResponse(request, async (session) => {
          const user = await requireAuthentication(session, prisma)
          const keyId = Number(params.id)
          const existing = await prisma.apiKey.findFirst({
            where: { id: keyId, userId: user.id },
          })
          if (existing === null) {
            throw new NotFoundException("API key not found.")
          }
          await prisma.apiKey.delete({ where: { id: keyId } })
          return { success: true }
        })
      },
    },
  },
})