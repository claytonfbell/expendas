import moment from "moment-timezone"
import {
  BadRequestException,
  MethodNotAllowedException,
} from "../../../src/exceptions/HttpException"
import applyMiddleware, {
  NextApiRequestApplied,
  NextApiResponseApplied,
} from "../../../src/middleware/applyMiddleware"
import Account from "../../../src/model/Account"
import Payment from "../../../src/model/Payment"
import PaymentRequest from "../../../src/model/PaymentRequest"
import validate from "../../../src/util/validate"

export default async (
  req: NextApiRequestApplied,
  res: NextApiResponseApplied
) => {
  await applyMiddleware(req, res)
  res.build(async () => {
    const {
      query: { paymentId },
    } = req
    const payment = await Payment.findOne({
      household: req.household._id,
      _id: paymentId,
    })
    if (payment === null) {
      throw new BadRequestException(`No payment found with id ${paymentId}`)
    }

    switch (req.method) {
      case "PUT":
        const {
          amount,
          paidTo,
          account,
          when,
          repeatsUntil,
          repeatsOnDaysOfMonth,
          repeatsOnMonthsOfYear,
          repeatsWeekly,
        }: PaymentRequest = req.body

        validate({ paymentId }).notEmpty()

        const accountModel = await Account.findOne({
          _id: account,
          household: req.household._id,
        })
        if (accountModel === null) {
          throw new BadRequestException("Account missing.")
        }

        payment.amount = amount
        payment.paidTo = paidTo
        payment.account = accountModel._id
        payment.when = moment(when).toDate()
        payment.repeatsUntil =
          repeatsUntil === null ? null : moment(repeatsUntil).toDate()
        payment.repeatsOnDaysOfMonth = repeatsOnDaysOfMonth
        payment.repeatsOnMonthsOfYear = repeatsOnMonthsOfYear
        payment.repeatsWeekly = repeatsWeekly

        await payment.save()

        return
        break
      case "DELETE":
        validate({ paymentId }).notEmpty()

        await payment.remove()

        return
        break
      default:
        throw new MethodNotAllowedException()
    }
  })
}
