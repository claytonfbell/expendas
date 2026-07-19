import { createRequire } from "node:module"
import { createFileRoute } from "@tanstack/react-router"
import { requireOrganizationAuthentication } from "../../components/requireAuthentication"
import { buildResponse } from "../../components/server/buildResponse"
import { getCloudFileStream } from "../../components/server/cloudFile"
import prisma from "../../components/server/prisma"

const { ZipArchive } = createRequire(import.meta.url)("archiver")

function arrayToCsv(rows: Record<string, unknown>[]): string {
  if (rows.length === 0) return ""
  const headers = Object.keys(rows[0])
  const csvRows = rows.map((row) =>
    headers
      .map((h) => {
        const val = row[h]
        if (val === null || val === undefined) return ""
        const str = typeof val === "object" ? JSON.stringify(val) : String(val)
        if (str.includes(",") || str.includes('"') || str.includes("\n")) {
          return `"${str.replace(/"/g, '""')}"`
        }
        return str
      })
      .join(",")
  )
  return [headers.join(","), ...csvRows].join("\n")
}

export const Route = createFileRoute("/api/organizations/$id/export")({
  server: {
    handlers: {
      GET: async ({ request, params }) => {
        return buildResponse(request, async (session) => {
          const organizationId = Number(params.id)
          const user = await requireOrganizationAuthentication(
            session,
            prisma,
            organizationId
          )

          const accountIds = (
            await prisma.account.findMany({
              where: { organizationId },
              select: { id: true },
            })
          ).map((a) => a.id)

          const paymentIds = (
            await prisma.payment.findMany({
              where: { accountId: { in: accountIds } },
              select: { id: true },
            })
          ).map((p) => p.id)

          const retirementPlanIds = (
            await prisma.retirementPlan.findMany({
              where: { organizationId },
              select: { id: true },
            })
          ).map((rp) => rp.id)

          const taskGroupIds = (
            await prisma.taskGroup.findMany({
              where: { organizationId },
              select: { id: true },
            })
          ).map((tg) => tg.id)

          const taskScheduleIds = (
            await prisma.taskSchedule.findMany({
              where: { taskGroupId: { in: taskGroupIds } },
              select: { id: true },
            })
          ).map((ts) => ts.id)

          const orgCloudFileIds = (
            await prisma.organizationCloudFile.findMany({
              where: { organizationId },
              select: { id: true },
            })
          ).map((cf) => cf.id)

          const [
            organization,
            usersOnOrg,
            accounts,
            payments,
            items,
            carryOvers,
            balanceHistory,
            retirementPlans,
            retirementPlanUsers,
            retirementPlanContributions,
            fixedIncomeAssets,
            taskGroups,
            taskGroupUsers,
            taskSchedules,
            tasks,
            orgCloudFiles,
            cloudFiles,
            receipts,
            taxRecords,
            mealsOut,
          ] = await Promise.all([
            prisma.organization.findUnique({ where: { id: organizationId } }),
            prisma.usersOnOrganizations.findMany({
              where: { organizationId },
            }),
            prisma.account.findMany({
              where: { organizationId },
              select: {
                id: true,
                organizationId: true,
                name: true,
                accountType: true,
                balance: true,
                creditCardType: true,
                accountBucket: true,
                plaidCredentialId: true,
                plaidAccountId: true,
              },
            }),
            prisma.payment.findMany({
              where: { accountId: { in: accountIds } },
            }),
            prisma.item.findMany({
              where: { paymentId: { in: paymentIds } },
            }),
            prisma.carryOver.findMany({
              where: { accountId: { in: accountIds } },
            }),
            prisma.accountBalanceHistory.findMany({
              where: { accountId: { in: accountIds } },
            }),
            prisma.retirementPlan.findMany({
              where: { organizationId },
            }),
            prisma.retirementPlanUser.findMany({
              where: { retirementPlanId: { in: retirementPlanIds } },
            }),
            prisma.retirementPlanContribution.findMany({
              where: { retirementPlanId: { in: retirementPlanIds } },
            }),
            prisma.fixedIncomeAsset.findMany({
              where: { accountId: { in: accountIds } },
            }),
            prisma.taskGroup.findMany({
              where: { organizationId },
            }),
            prisma.taskGroupUser.findMany({
              where: { taskGroupId: { in: taskGroupIds } },
            }),
            prisma.taskSchedule.findMany({
              where: { taskGroupId: { in: taskGroupIds } },
            }),
            prisma.task.findMany({
              where: { taskScheduleId: { in: taskScheduleIds } },
            }),
            prisma.organizationCloudFile.findMany({
              where: { organizationId },
              include: { cloudFile: true },
            }),
            prisma.cloudFile.findMany({
              where: {
                organizationCloudFiles: {
                  some: { organizationId },
                },
              },
            }),
            prisma.receipt.findMany({
              where: {
                organizationCloudFileId: { in: orgCloudFileIds },
              },
            }),
            prisma.taxRecord.findMany({
              where: {
                organizationCloudFileId: { in: orgCloudFileIds },
              },
            }),
            prisma.mealsOut.findMany({
              where: { organizationId },
            }),
          ])

          const archive = new ZipArchive({ zlib: { level: 9 } })
          const chunks: Buffer[] = []

          archive.on("data", (chunk: Buffer) => chunks.push(chunk))

          const csvTables: Record<string, Record<string, unknown>[]> = {
            organization: organization
              ? [organization as Record<string, unknown>]
              : [],
            users_on_organizations: usersOnOrg as Record<string, unknown>[],
            accounts: accounts as Record<string, unknown>[],
            payments: payments as Record<string, unknown>[],
            items: items as Record<string, unknown>[],
            carry_overs: carryOvers as Record<string, unknown>[],
            account_balance_history: balanceHistory as Record<
              string,
              unknown
            >[],
            retirement_plans: retirementPlans as Record<string, unknown>[],
            retirement_plan_users: retirementPlanUsers as Record<
              string,
              unknown
            >[],
            retirement_plan_contributions:
              retirementPlanContributions as Record<string, unknown>[],
            fixed_income_assets: fixedIncomeAssets as Record<string, unknown>[],
            task_groups: taskGroups as Record<string, unknown>[],
            task_group_users: taskGroupUsers as Record<string, unknown>[],
            task_schedules: taskSchedules as Record<string, unknown>[],
            tasks: tasks as Record<string, unknown>[],
            organization_cloud_files: orgCloudFiles.map((f) => ({
              ...f,
              cloudFile: undefined,
            })) as Record<string, unknown>[],
            cloud_files: cloudFiles as Record<string, unknown>[],
            receipts: receipts as Record<string, unknown>[],
            tax_records: taxRecords as Record<string, unknown>[],
            meals_out: mealsOut as Record<string, unknown>[],
          }

          for (const [name, rows] of Object.entries(csvTables)) {
            archive.append(arrayToCsv(rows), { name: `${name}.csv` })
          }

          for (const orgCloudFile of orgCloudFiles) {
            try {
              const stream = await getCloudFileStream(orgCloudFile.cloudFile)
              const fileChunks: Buffer[] = []
              for await (const chunk of stream) {
                fileChunks.push(
                  Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)
                )
              }
              archive.append(Buffer.concat(fileChunks), {
                name: `files/${orgCloudFile.name}`,
              })
            } catch {
              archive.append("File not available", {
                name: `files/${orgCloudFile.name}.error.txt`,
              })
            }
          }

          await archive.finalize()

          const zipBuffer = Buffer.concat(chunks)

          return new Response(zipBuffer, {
            headers: {
              "Content-Type": "application/zip",
              "Content-Disposition": `attachment; filename="${organization?.name ?? "organization"}-export.zip"`,
            },
          })
        })
      },
    },
  },
})
