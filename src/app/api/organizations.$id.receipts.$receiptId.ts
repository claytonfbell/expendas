import { Receipt } from "@prisma/client"
import { requireOrganizationAuthentication } from "../../../lib/requireAuthentication"
import { BadRequestException } from "../../../lib/server/HttpException"
import { buildResponse } from "../../../lib/server/buildResponse"
import prisma from "../../../lib/server/prisma"
import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/api/organizations/$id/receipts/$receiptId")({
  server: {
    handlers: {
  GET: async ({ request, params }) => {
    return buildResponse(request, async (session) => {
      const organizationId = Number(params.id)
      const receiptId = Number(params.receiptId)
      await requireOrganizationAuthentication(session, prisma, organizationId)
      const receipt = await prisma.receipt.findUnique({
        where: {
          id: receiptId,
          organizationCloudFile: {
            organizationId,
          },
        },
        include: {
          account: true,
          organizationCloudFile: {
            include: {
              cloudFile: true,
            },
          },
        },
      })

      if (!receipt) {
        throw new BadRequestException("Receipt not found.")
      }

      return receipt
    })
  },
  PUT: async ({ request, params }) => {
    return buildResponse(request, async (session) => {
      const organizationId = Number(params.id)
      const receiptId = Number(params.receiptId)
      await requireOrganizationAuthentication(session, prisma, organizationId)

      const requestBody: Receipt = await request.json()

      await prisma.receipt.update({
        data: {
          amount: requestBody.amount,
          date: requestBody.date,
          datePaid: requestBody.datePaid,
          accountId: requestBody.accountId,
          merchant: requestBody.merchant,
          receiptType: requestBody.receiptType,
        },
        where: { id: receiptId },
        include: {
          account: true,
          organizationCloudFile: {
            include: {
              cloudFile: true,
            },
          },
        },
      })
    })
  },
  DELETE: async ({ request, params }) => {
    return buildResponse(request, async (session) => {
      const organizationId = Number(params.id)
      const receiptId = Number(params.receiptId)
      await requireOrganizationAuthentication(session, prisma, organizationId)
      await prisma.receipt.delete({
        where: { id: receiptId },
      })
    })
  },

    }
  }
})
