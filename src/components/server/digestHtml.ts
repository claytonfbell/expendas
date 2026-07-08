import dayjs from "../dayjs"
import prisma from "./prisma"

export async function generateDigestHtml(
  userId: number,
  organizationId: number
): Promise<string> {
  const today = dayjs()
  const todayStr = today.format("YYYY-MM-DD")
  const yesterdayStr = today.subtract(1, "day").format("YYYY-MM-DD")

  const [accounts, tasks, yesterdayHistories] = await Promise.all([
    prisma.account.findMany({
      where: { organizationId },
      select: { id: true, name: true, balance: true },
    }),
    prisma.task.findMany({
      where: {
        taskSchedule: {
          taskGroup: {
            organizationId,
            users: { some: { userId } },
          },
        },
        date: todayStr,
      },
      include: {
        taskSchedule: {
          include: {
            taskGroup: true,
          },
        },
      },
      orderBy: [
        { taskSchedule: { taskGroup: { sortOrder: "asc" } } },
        { taskSchedule: { sortOrder: "asc" } },
      ],
    }),
    prisma.accountBalanceHistory.findMany({
      where: {
        account: { organizationId },
        date: yesterdayStr,
      },
      select: { accountId: true, balance: true },
    }),
  ])

  const currentNetWorth = accounts.reduce((sum, a) => sum + a.balance, 0)
  const yesterdayMap = new Map(
    yesterdayHistories.map((h) => [h.accountId, h.balance])
  )
  const yesterdayNetWorth = accounts.reduce(
    (sum, a) => sum + (yesterdayMap.get(a.id) ?? a.balance),
    0
  )
  const change = currentNetWorth - yesterdayNetWorth

  const groupTasksMap = new Map<string, typeof tasks>()
  for (const task of tasks) {
    const groupName = task.taskSchedule.taskGroup.name
    if (!groupTasksMap.has(groupName)) groupTasksMap.set(groupName, [])
    groupTasksMap.get(groupName)!.push(task)
  }

  const centsToDollars = (cents: number) => {
    const sign = cents < 0 ? "-" : ""
    const abs = Math.abs(cents)
    return `${sign}$${(abs / 100).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }

  const tasksHtml = [...groupTasksMap.entries()]
    .map(
      ([groupName, groupTasks]) => `
        <tr>
          <td style="padding: 8px 0 4px; font-size: 14px; font-weight: 700; color: #555; text-transform: uppercase; letter-spacing: 0.05em; border-bottom: 1px solid #eee;">
            ${groupName}
          </td>
        </tr>
        ${groupTasks
          .map(
            (task) => `
          <tr>
            <td style="padding: 6px 0 6px 12px; font-size: 15px; color: ${task.completed ? "#999" : "#333"};">
              <span style="${task.completed ? "text-decoration: line-through; color: #bbb;" : ""}">
                ${task.completed ? "✓" : "○"} ${task.taskSchedule.name}${task.taskSchedule.description ? ` — ${task.taskSchedule.description}` : ""}
              </span>
            </td>
          </tr>`
          )
          .join("")}`
    )
    .join("")

  const changeColor = change >= 0 ? "#16a34a" : "#dc2626"
  const changeArrow = change >= 0 ? "▲" : "▼"
  const changeLabel =
    change !== 0
      ? `${changeArrow} ${centsToDollars(Math.abs(change))} from yesterday`
      : "No change from yesterday"

  const formattedDate = today.format("dddd, MMMM D, YYYY")

  return `<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
  <meta name="viewport" content="width=device-width" />
  <title>Expendas Daily Digest</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f4f6f8; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f4f6f8;">
    <tr>
      <td align="center" style="padding: 40px 16px;">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="background-color: #ffffff; border-radius: 12px; box-shadow: 0 2px 12px rgba(0,0,0,0.08); overflow: hidden;">
          <tr>
            <td style="background: linear-gradient(135deg, #0088b3 0%, #005f8a 100%); padding: 32px 32px 28px; text-align: center;">
              <h1 style="margin: 0 0 4px; font-size: 24px; font-weight: 700; color: #ffffff; letter-spacing: 0.02em;">Expendas Daily Digest</h1>
              <p style="margin: 0; font-size: 14px; color: rgba(255,255,255,0.85);">${formattedDate}</p>
            </td>
          </tr>

          <tr>
            <td style="padding: 28px 32px 24px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="font-size: 12px; font-weight: 600; color: #888; text-transform: uppercase; letter-spacing: 0.08em; padding-bottom: 8px;">Net Worth</td>
                </tr>
                <tr>
                  <td style="font-size: 32px; font-weight: 700; color: #1a1a2e; padding-bottom: 4px;">${centsToDollars(currentNetWorth)}</td>
                </tr>
                <tr>
                  <td style="font-size: 14px; font-weight: 500; color: ${changeColor}; padding-bottom: 4px;">${changeLabel}</td>
                </tr>
              </table>
            </td>
          </tr>

          <tr>
            <td style="padding: 0 32px;">
              <hr style="border: none; border-top: 1px solid #e8eaed; margin: 0;" />
            </td>
          </tr>

          <tr>
            <td style="padding: 24px 32px 32px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="font-size: 12px; font-weight: 600; color: #888; text-transform: uppercase; letter-spacing: 0.08em; padding-bottom: 12px;">
                    Today's Tasks
                    <span style="color: #999; font-weight: 400;">(${tasks.length})</span>
                  </td>
                </tr>
                ${tasksHtml || `<tr><td style="padding: 16px 0; font-size: 15px; color: #999; font-style: italic;">No tasks scheduled for today.</td></tr>`}
              </table>
            </td>
          </tr>

          <tr>
            <td style="background-color: #f8fafc; padding: 16px 32px; text-align: center; border-top: 1px solid #e8eaed;">
              <p style="margin: 0; font-size: 12px; color: #999;">
                Expendas &mdash; Financial management, simplified.
                <br/>
                <a href="https://expendas.com" style="color: #0088b3; text-decoration: none;">expendas.com</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}