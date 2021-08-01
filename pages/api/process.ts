import { formatDateTime } from "material-ui-pack"
import moment from "moment"
import { NextApiRequest, NextApiResponse } from "next"
import { MonitorItem } from "../../lib/api/MonitorResponse"
import { formatDuration, formatFromNow } from "../../lib/formatFromNow"
import { buildMonitorItem } from "../../lib/server/buildMonitorItem"
import { buildResponse } from "../../lib/server/buildResponse"
import prisma from "../../lib/server/prisma"
import { sendEmail } from "../../lib/server/sendEmail"

async function handler(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> {
  buildResponse(res, async () => {
    if (req.method === "GET") {
      // look for new failures
      const itemsToSend: MonitorItem[] = []
      const pingSetups = await prisma.pingSetup.findMany({
        include: { lastPing: true, lastSuccessfulPing: true },
      })
      for (let i = 0; i < pingSetups.length; i++) {
        const pingSetup = pingSetups[i]
        const monitorItem = await buildMonitorItem(pingSetup)
        if (monitorItem !== null) {
          if (monitorItem.status === "failed" && !pingSetup.notified) {
            itemsToSend.push(monitorItem)
          }
          // reset previously notified items if status is ok
          else if (monitorItem.status === "ok" && pingSetup.notified) {
            await prisma.pingSetup.update({
              where: { id: monitorItem.pingSetup.id },
              data: {
                notified: false,
              },
            })
          }
          // delete old rows if status is ok
          if (monitorItem.status === "ok") {
            // first delete "old" relative to the inverval amount
            const old: Date = moment()
              .subtract(monitorItem.lastPing.interval * 144, "minutes")
              .toDate()
            await prisma.ping.deleteMany({
              where: {
                pingSetupId: { equals: pingSetup.id },
                time: { lt: old },
              },
            })
          }

          // next we hard-cap the total limit
          const maxKeepRows = monitorItem.status === "ok" ? 500 : 5000
          const cutoff = await prisma.ping.findMany({
            where: {
              pingSetupId: pingSetup.id,
            },
            skip: maxKeepRows,
            take: 1,
            orderBy: { id: "desc" },
          })
          if (cutoff.length > 0) {
            console.log(`DELETING ALL ROWS PRIOR TO CUTOFF ID ${cutoff[0].id}`)
            await prisma.ping.deleteMany({
              where: {
                pingSetupId: { equals: pingSetup.id },
                id: { lt: cutoff[0].id },
              },
            })
          }
        }
      }

      // get list of recipients first
      let recipients: string[] = itemsToSend.flatMap(
        (item) => item.pingSetup.emails
      )
      // filter out duplicates
      recipients = recipients.filter(function (item, pos) {
        return recipients.indexOf(item) == pos
      })

      // send each recipient an email notification
      for (let i = 0; i < recipients.length; i++) {
        const email = recipients[i]
        // gather up the items they should receive
        const items = itemsToSend.filter((x) =>
          x.pingSetup.emails.includes(email)
        )
        const subject = `${items.length} New Status Monitor Failure${
          items.length > 1 ? "s" : ""
        }`
        const text = `# ${subject}

-------------------

${items
  .map(
    (item) => `## ${item.pingSetup.groupName} / ${item.pingSetup.name}

Last successful ping was **${formatFromNow(
      item.lastSuccessfulPing.time
    )}** at ${formatDateTime(
      moment(item.lastSuccessfulPing.time).toISOString(),
      "America/New_York"
    )}

Ping expected every ${formatDuration(item.lastPing.interval * 60000)}

${item.lastPing.details}

<https://status-monitor.app/pings/${item.pingSetup.id}>

`
  )
  .join("\n\n-------------------\n\n")}
`
        await sendEmail({ to: email, subject, text }).catch((e) => {
          console.log("FAILED TO SEND")
        })
      }

      // mark each item as already been notified
      for (let i = 0; i < itemsToSend.length; i++) {
        const pingSetup = itemsToSend[i].pingSetup
        await prisma.pingSetup.update({
          where: { id: pingSetup.id },
          data: {
            notified: true,
          },
        })
      }

      return recipients
    }
  })
}

export default handler
