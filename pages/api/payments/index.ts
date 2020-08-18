import { default as Account } from "../../../src/db/Account"
import Payment, { IPayment } from "../../../src/db/Payment"
import {
  BadRequestException,
  MethodNotAllowedException,
} from "../../../src/exceptions/HttpException"
import applyMiddleware, {
  NextApiRequestApplied,
  NextApiResponseApplied,
} from "../../../src/middleware/applyMiddleware"
import validate from "../../../src/util/validate"

export default async (
  req: NextApiRequestApplied,
  res: NextApiResponseApplied
) => {
  await applyMiddleware(req, res)
  res.build(async () => {
    switch (req.method) {
      case "POST":
        const {
          amount,
          paidTo,
          account,
          date,
          repeatsUntilDate,
          repeatsOnDaysOfMonth,
          repeatsOnMonthsOfYear,
          repeatsWeekly,
        }: IPayment = req.body

        validate({ paidTo }).min(1)
        validate({ account }).notEmpty()

        const accountModel = await Account.findOne({
          _id: account,
          household: req.household._id,
        })
        if (accountModel === null) {
          throw new BadRequestException("Account missing.")
        }

        Payment.create({
          household: req.household._id,
          amount,
          paidTo,
          account: accountModel._id,
          date,
          repeatsUntilDate,
          repeatsOnDaysOfMonth,
          repeatsOnMonthsOfYear,
          repeatsWeekly,
        })
        break
      case "GET":
        // FETCH ALL PAYMENTS
        const allPayments = await Payment.find({
          household: req.household._id,
        }).populate("account")
        return allPayments.sort(
          (a, b) => Math.abs(b.amount) - Math.abs(a.amount)
        )
        break
      default:
        throw new MethodNotAllowedException()
    }
  })
}
