import { createFileRoute } from "@tanstack/react-router"
import { requireEmailAuthentication } from "../../components/requireAuthentication"
import { buildResponse } from "../../components/server/buildResponse"
import { ForbiddenException } from "../../components/server/HttpException"
import { pruneS3Storage } from "../../components/server/cloudFile"
import prisma from "../../components/server/prisma"

const ALLOWED_EMAIL = "claytonfbell@gmail.com"

export const Route = createFileRoute("/api/cloud-files/prune-s3")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        return buildResponse(request, async (session) => {
          if (process.env.NODE_ENV !== "production") {
            throw new ForbiddenException(
              "This action is not available in development mode."
            )
          }
          await requireEmailAuthentication(session, prisma, ALLOWED_EMAIL)
          return await pruneS3Storage()
        })
      },
    },
  },
})
