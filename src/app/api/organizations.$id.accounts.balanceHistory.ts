import dayjs from "../../components/dayjs"
import { buildResponse } from "../../components/server/buildResponse"
import prisma from "../../components/server/prisma"
import { ReportRange } from "../../components/TrendsReportsTimeRangeSelect"
import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/api/organizations/$id/accounts/balanceHistory")({
  server: {
    handlers: {
  GET: async ({ request, params }) => {
    return buildResponse(request, async (session) => {
      const organizationId = Number(params.id)
      const url = new URL(request.url)
      const range: ReportRange = url.searchParams.get("range") as ReportRange
      console.log("range", range)

      const balanceHistory = await prisma.account.findMany({
        where: {
          organizationId,
        },
        include: {
          balanceHistory: {
            select: {
              id: true,
              balance: true,
              fixedIncome: true,
              marketHigh: true,
              marketLow: true,
              date: true,
            },
            orderBy: {
              date: "asc",
            },
            where: {
              date: {
                gte: (() => {
                  const now = dayjs()
                  switch (range) {
                    case "1W":
                      return now.subtract(1, "week").format("YYYY-MM-DD")
                    case "1M":
                      return now.subtract(1, "month").format("YYYY-MM-DD")
                    case "3M":
                      return now.subtract(3, "month").format("YYYY-MM-DD")
                    case "6M":
                      return now.subtract(6, "month").format("YYYY-MM-DD")
                    case "YTD":
                      return now.startOf("year").format("YYYY-MM-DD")
                    case "1Y":
                      return now.subtract(1, "year").format("YYYY-MM-DD")
                    case "2Y":
                      return now.subtract(2, "year").format("YYYY-MM-DD")
                    case "ALL":
                      return now.subtract(50, "year").format("YYYY-MM-DD")
                  }
                })(),
              },
            },
          },
        },
      })

      return balanceHistory
    })
  },

    }
  }
})
