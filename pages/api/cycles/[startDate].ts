import moment from "moment"
import { CycleService } from "."
import { MethodNotAllowedException } from "../../../src/exceptions/HttpException"
import applyMiddleware, {
  NextApiRequestApplied,
  NextApiResponseApplied,
} from "../../../src/middleware/applyMiddleware"
import Payment, { IPayment } from "../../../src/model/Payment"

export default async (
  req: NextApiRequestApplied,
  res: NextApiResponseApplied
) => {
  await applyMiddleware(req, res)
  res.build(async () => {
    switch (req.method) {
      case "GET":
        const {
          query: { startDate },
        } = req

        // find cycle end date
        const rangeStart = moment(startDate)
        let rangeEnd = moment(startDate).add(6, "months")
        const cycles = await new CycleService().getCyclesWithHousehold(
          req.household,
          rangeStart,
          rangeEnd
        )
        // next cycle
        rangeEnd = moment(cycles[1])

        // get all relevant payments
        const allPayments = await Payment.find({
          household: req.household._id,
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

        return cyclePayments.sort(
          (a, b) => Math.abs(b.amount) - Math.abs(a.amount)
        )
        break
      default:
        throw new MethodNotAllowedException()
    }
  })
}
