import dayjs from "dayjs"
import Imap from "imap"
import { NextApiResponse } from "next"
import { requireOrganizationAuthentication } from "../../../../../lib/requireAuthentication"
import { buildResponse } from "../../../../../lib/server/buildResponse"
import prisma from "../../../../../lib/server/prisma"
import withSession, { NextIronRequest } from "../../../../../lib/server/session"

async function handler(
  req: NextIronRequest,
  res: NextApiResponse
): Promise<void> {
  buildResponse(res, async () => {
    const organizationId = Number(req.query.id)
    const user = await requireOrganizationAuthentication(
      req,
      prisma,
      organizationId
    )
    if (user.id !== Number(process.env.SUPER_ADMIN_USER_ID)) {
      throw new Error("You are not authorized to perform this action.")
    }
    if (req.method === "POST") {
      return scrapeEmailsFromFidelityAndUpdateBalances()
    }
  })
}

export default withSession(handler)

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
        // https://www.marshallsoft.com/ImapSearch.htm
        // search messages from last 25 hours from Fidelity.Alerts@Fidelity.com
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
                  // Account: XXXXX4979
                  // look for string
                  const match = buffer.match(/Account: +[X]+(\d+)/)
                  if (match) {
                    console.log("Account: ", match[1])
                    const accountLastFour = match[1]
                    // find the account id
                    const accountId = accountScrapeMappings.find(
                      (account) =>
                        account.fidelityAccountLastFour === accountLastFour
                    )?.accountId

                    if (accountId) {
                      console.log("Account ID: ", accountId)
                      // now find all dollar amounts
                      const dollarAmounts = buffer.match(/\$[\d,]+\.\d+/g)
                      if (dollarAmounts) {
                        console.log("Dollar Amounts: ", dollarAmounts)
                        // now get the greatest dollar amount
                        const greatestDollarAmount = Math.max(
                          ...dollarAmounts.map((amount) =>
                            Number(amount.replace(/[^0-9.-]+/g, ""))
                          )
                        )
                        console.log(
                          "Greatest Dollar Amount: ",
                          greatestDollarAmount
                        )
                        // now update the balance in the database
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
