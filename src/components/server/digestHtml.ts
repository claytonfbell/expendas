import dayjs from "../dayjs"
import prisma from "./prisma"

const BASE_COLORS: Record<string, string> = {
  Blue: "#0088b3",
  Green: "#388e3c",
  Red: "#d32f2f",
  Yellow: "#d9c751",
  Purple: "#7b1fa2",
  Orange: "#f57c00",
  Gray: "#616161",
}

function hexForColor(color: string): string {
  return BASE_COLORS[color] ?? "#1976d2"
}

export async function generateDigestHtml(
  userId: number,
  organizationId: number
): Promise<string> {
  const today = dayjs()
  const todayStr = today.format("YYYY-MM-DD")
  const yesterdayStr = today.subtract(1, "day").format("YYYY-MM-DD")

  const [accounts, tasks, yesterdayHistories, latestMealOut] =
    await Promise.all([
      prisma.account.findMany({
        where: { organizationId },
        select: { id: true, name: true, balance: true, accountType: true },
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
      prisma.mealsOut.findFirst({
        where: { organizationId },
        orderBy: { date: "desc" },
        select: { date: true },
      }),
    ])

  const savingsTypes = new Set(["CD", "Savings_Account", "Investment"])
  const yesterdayMap = new Map(
    yesterdayHistories.map((h) => [h.accountId, h.balance])
  )
  const totalSavings = accounts
    .filter((a) => savingsTypes.has(a.accountType))
    .reduce((sum, a) => sum + a.balance, 0)
  const yesterdaySavings = accounts
    .filter((a) => savingsTypes.has(a.accountType))
    .reduce((sum, a) => sum + (yesterdayMap.get(a.id) ?? a.balance), 0)
  const savingsChange = totalSavings - yesterdaySavings

  const currentNetWorth = accounts.reduce((sum, a) => sum + a.balance, 0)
  const yesterdayNetWorth = accounts.reduce(
    (sum, a) => sum + (yesterdayMap.get(a.id) ?? a.balance),
    0
  )
  const change = currentNetWorth - yesterdayNetWorth
  const changeColor = change >= 0 ? "#16a34a" : "#dc2626"
  const changeArrow = change >= 0 ? "▲" : "▼"
  const changeLabel =
    change !== 0
      ? `${changeArrow} ${centsToDollars(Math.abs(change))} from yesterday`
      : "No change from yesterday"

  const daysSinceMealOut = latestMealOut
    ? today.diff(dayjs(latestMealOut.date), "day")
    : null

  const groupTasksMap = new Map<string, { tasks: typeof tasks; color: string }>()
  for (const task of tasks) {
    const key = task.taskSchedule.taskGroup.name
    if (!groupTasksMap.has(key)) {
      groupTasksMap.set(key, {
        tasks: [],
        color: hexForColor(task.taskSchedule.taskGroup.color),
      })
    }
    groupTasksMap.get(key)!.tasks.push(task)
  }

  const centsToDollars = (cents: number) => {
    const sign = cents < 0 ? "-" : ""
    const abs = Math.abs(cents)
    return `${sign}$${(abs / 100).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }

  const tasksHtml = [...groupTasksMap.entries()]
    .map(
      ([groupName, { tasks: groupTasks, color }]) => `
        <tr>
          <td style="padding: 8px 0 4px; font-size: 14px; font-weight: 700; color: ${color}; text-transform: uppercase; letter-spacing: 0.05em; border-bottom: 1px solid #eee;">
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

  const savingsChangeColor = savingsChange >= 0 ? "#16a34a" : "#dc2626"
  const savingsChangeArrow = savingsChange >= 0 ? "▲" : "▼"
  const savingsChangeLabel =
    savingsChange !== 0
      ? `${savingsChangeArrow} ${centsToDollars(Math.abs(savingsChange))} from yesterday`
      : "No change from yesterday"

  const formattedDate = today.format("dddd, MMMM D, YYYY")

  const statBoxStyle =
    "background-color: #f0f9ff; border: 1px solid #bae6fd; border-radius: 8px; padding: 12px 16px; text-align: center;"

  return `<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
  <meta name="viewport" content="width=device-width" />
  <title>Expendas Daily</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f4f6f8; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f4f6f8;">
    <tr>
      <td align="center" style="padding: 40px 16px;">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="background-color: #ffffff; border-radius: 12px; box-shadow: 0 2px 12px rgba(0,0,0,0.08); overflow: hidden;">
          <tr>
            <td style="background: linear-gradient(135deg, #0088b3 0%, #005f8a 100%); padding: 32px 32px 28px; text-align: center;">
              <h1 style="margin: 0 0 4px; font-size: 24px; font-weight: 700; color: #ffffff; letter-spacing: 0.02em;">Expendas Daily</h1>
              <p style="margin: 0; font-size: 14px; color: rgba(255,255,255,0.85);">${formattedDate}</p>
            </td>
          </tr>

          <tr>
            <td style="padding: 28px 32px 8px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="font-size: 12px; font-weight: 600; color: #888; text-transform: uppercase; letter-spacing: 0.08em; padding-bottom: 8px;">Net Worth</td>
                </tr>
                <tr>
                  <td style="font-size: 32px; font-weight: 700; color: #1a1a2e; padding-bottom: 2px;">${centsToDollars(currentNetWorth)}</td>
                </tr>
                <tr>
                  <td style="font-size: 14px; font-weight: 500; color: ${changeColor}; padding-bottom: 4px;">${changeLabel}</td>
                </tr>
              </table>
            </td>
          </tr>

          <tr>
            <td style="padding: 8px 32px 8px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="font-size: 12px; font-weight: 600; color: #888; text-transform: uppercase; letter-spacing: 0.08em; padding-bottom: 8px;">Total Savings</td>
                </tr>
                <tr>
                  <td style="font-size: 32px; font-weight: 700; color: #1a1a2e; padding-bottom: 2px;">${centsToDollars(totalSavings)}</td>
                </tr>
                <tr>
                  <td style="font-size: 14px; font-weight: 500; color: ${savingsChangeColor}; padding-bottom: 4px;">${savingsChangeLabel}</td>
                </tr>
              </table>
            </td>
          </tr>

          <tr>
            <td style="padding: 16px 32px 8px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="${statBoxStyle}">
                    <span style="font-size: 12px; font-weight: 600; color: #0369a1; text-transform: uppercase; letter-spacing: 0.05em;">Days Since Last Meal Out</span>
                    <br/>
                    <span style="font-size: 28px; font-weight: 700; color: #0284c7; line-height: 1.4;">
                      ${daysSinceMealOut !== null ? daysSinceMealOut : "—"}
                    </span>
                    <span style="font-size: 13px; color: #0369a1;">
                      ${daysSinceMealOut === 1 ? "day" : "days"}
                    </span>
                  </td>
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