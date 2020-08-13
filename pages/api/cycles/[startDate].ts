import moment from "moment-timezone"
import { CycleService } from "."
import CycleItem from "../../../src/db/CycleItem"
import Payment, { IPayment } from "../../../src/db/Payment"
import { MethodNotAllowedException } from "../../../src/exceptions/HttpException"
import applyMiddleware, {
  NextApiRequestApplied,
  NextApiResponseApplied,
} from "../../../src/middleware/applyMiddleware"
import { IHousehold } from "../../../src/model/Household"

export default async (
  req: NextApiRequestApplied,
  res: NextApiResponseApplied
) => {
  await applyMiddleware(req, res)
  res.build(async () => {
    const {
      query: { startDate },
    } = req

    switch (req.method) {
      case "GET":
        const buildCycleService = new BuildCycleService()
        return await buildCycleService.build(req.household, startDate as string)

        break
      default:
        throw new MethodNotAllowedException()
    }
  })
}

class BuildCycleService {
  async build(household: IHousehold, cycleDate: string) {
    // find cycle end date
    const rangeStart = moment(cycleDate)
    let rangeEnd = moment(cycleDate).add(6, "months")
    const cycles = await new CycleService().getCycleDatesWithHouseHold(
      household,
      rangeStart,
      rangeEnd
    )
    // next cycle
    rangeEnd = moment(cycles[1])

    // get all relevant payments
    const allPayments = await Payment.find({
      household: household._id,
    }).populate("account")

    let cyclePayments: IPayment[] = []
    const cursor = moment(rangeStart)
    while (cursor.isBefore(rangeEnd)) {
      const payments = new CycleService().filterPaymentsOnDate(
        allPayments,
        cursor
      )
      cyclePayments = [...cyclePayments, ...payments]
      cursor.add(1, "days")
    }

    cyclePayments = cyclePayments.sort(
      (a, b) => Math.abs(b.amount) - Math.abs(a.amount)
    )

    // find cycle items
    let items = await CycleItem.find({
      household: household._id,
      date: cycleDate,
    })

    // remove items that don't have payments
    items
      .filter(
        (x) =>
          cyclePayments.filter((y) => String(y._id) === String(x.payment._id))
            .length === 0
      )
      .forEach(async (x) => await x.remove())

    // add items that don't exist
    const addThese = cyclePayments.filter(
      (x) =>
        items.filter((y) => String(y.payment) === String(x._id)).length === 0
    )

    for (let i = 0; i < addThese.length; i++) {
      const p = addThese[i]

      console.log("HERE!")
      console.log(p)

      const item = await CycleItem.create({
        household: household._id,
        payment: p._id,
        date: cycleDate,
        amount: p.amount,
        isPaid: false,
      })
      console.log("HERE 2!")
      console.log(household._id)
      items.push(item)
    }

    items = await CycleItem.find({
      household: household._id,
      date: cycleDate,
    }).populate({ path: "payment", populate: { path: "account" } })
    return items.sort((a, b) => Math.abs(b.amount) - Math.abs(a.amount))
  }
}
