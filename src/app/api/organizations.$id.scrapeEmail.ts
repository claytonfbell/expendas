import dayjs from "dayjs"
import Imap from "imap"
import { requireOrganizationAuthentication } from "../../../lib/requireAuthentication"
import { buildResponse } from "../../../lib/server/buildResponse"
import prisma from "../../../lib/server/prisma"
import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute(
  "/api/organizations/$id/scrapeEmail"
)({
  server: {
    handlers: {  
    POST: async ({ request, params }) => {
      return buildResponse(request, async (session) => {
        const organizationId = Number(params.id)
        const user = await requireOrganizationAuthentication(
          session,
          prisma,
          organizationId
        )
        if (user.id !== Number(process.env.SUPER_ADMIN_USER_ID)) {
          throw new Error("You are not authorized to perform this action.")
        }
        return scrapeEmailsFromFidelityAndUpdateBalances()
      })
    },
  
    }
  }
})

type AccountScrapeMap = {
  accountId: number
  fidelityAccountLastFour: string | undefined
}

const accountScrapeMappings: AccountScrapeMap[] = [
  {
    accountId: 33,
    fidelityAccountLastFour: process.env.FIDELITY_ACCOUNT_LAST_FOUR_33,
  },
  {
    accountId: 10,
    fidelityAccountLastFour: process.env.FIDELITY_ACCOUNT_LAST_FOUR_10,
  },
  {
    accountId: 14,
    fidelityAccountLastFour: process.env.FIDELITY_ACCOUNT_LAST_FOUR_14,
  },
  {
    accountId: 34,
    fidelityAccountLastFour: process.env.FIDELITY_ACCOUNT_LAST_FOUR_34,
  },
  {
    accountId: 11,
    fidelityAccountLastFour: process.env.FIDELITY_ACCOUNT_LAST_FOUR_11,
  },
  {
    accountId: 29,
    fidelityAccountLastFour: process.env.FIDELITY_ACCOUNT_LAST_FOUR_29,
  },
]

async function scrapeEmailsFromFidelityAndUpdateBalances() {
  return new Promise((resolve, reject) => {
    const imap = new Imap({
      user: process.env.GOOGLE_APP_EMAIL_FOR_EMAIL_SCRAPE || "",
      password: process.env.GOOGLE_APP_PASSWORD_FOR_EMAIL_SCRAPE || "",
      host: "imap.gmail.com",
      port: 993,
      tls: true,
      tlsOptions: { rejectUnauthorized: false },
    })

    let updatedAccounts = 0

    imap.once("ready", function () {
      imap.openBox("INBOX", true, function (err, box) {
        if (err) throw err
        const yesterday = dayjs()
          .subtract(25, "hour")
          .format("MMM DD, YYYY HH:mm:ss")
        imap.search(
          [
            "ALL",
            ["SINCE", yesterday],
            ["FROM", process.env.FIDELITY_FROM_EMAIL || ""],
          ],
          (err, results) => {
            if (err) throw err
            var f = imap.fetch(results, { bodies: "" })
            f.on("message", function (msg, seqno) {
              msg.on("body", function (stream, info) {
                let buffer = ""
                stream.on("data", function (chunk) {
                  buffer += chunk.toString("utf8")
                })
                stream.once("end", function () {
                  const match = buffer.match(/Account: +[X]+(\d+)/)
                  if (match) {
                    console.log("Account: ", match[1])
                    const accountLastFour = match[1]
                    const accountId = accountScrapeMappings.find(
                      (account) =>
                        account.fidelityAccountLastFour === accountLastFour
                    )?.accountId

                    if (accountId) {
                      console.log("Account ID: ", accountId)
                      const dollarAmounts = buffer.match(/\$[\d,]+\.\d+/g)
                      if (dollarAmounts) {
                        console.log("Dollar Amounts: ", dollarAmounts)
                        const greatestDollarAmount = Math.max(
                          ...dollarAmounts.map((amount) =>
                            Number(amount.replace(/[^0-9.-]+/g, ""))
                          )
                        )
                        console.log(
                          "Greatest Dollar Amount: ",
                          greatestDollarAmount
                        )
                        updatedAccounts++
                        prisma.account
                          .update({
                            where: { id: accountId },
                            data: {
                              balance: Math.round(greatestDollarAmount * 100),
                            },
                          })
                          .then((account) => {
                            console.log("Updated account: ", account)
                          })
                          .catch((err) => {
                            console.error(err)
                          })
                      }
                    }
                  }
                })
              })
            })
            f.once("error", function (err) {
              console.log("Fetch error: " + err)
            })
            f.once("end", function () {
              console.log("Done fetching all messages!")
              imap.end()
            })
          }
        )
      })
    })

    imap.once("error", function (err: any) {
      console.log(err)
      reject({ success: false, error: err })
    })

    imap.once("end", function () {
      console.log("Connection ended")
      resolve({
        success: true,
        message: `Updated ${updatedAccounts} account balances.`,
      })
    })

    imap.connect()
  })
}
