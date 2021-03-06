import Account from "../../../src/db/Account"
import CycleItem from "../../../src/db/CycleItem"
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
          date,
          repeatsUntilDate,
          repeatsOnDaysOfMonth,
          repeatsOnMonthsOfYear,
          repeatsWeekly,
        }: IPayment = req.body

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
        payment.date = date
        payment.repeatsUntilDate = repeatsUntilDate
        payment.repeatsOnDaysOfMonth = repeatsOnDaysOfMonth
        payment.repeatsOnMonthsOfYear = repeatsOnMonthsOfYear
        payment.repeatsWeekly = repeatsWeekly

        await payment.save()

        // remove existing cycle items - they will be regenerated
        await CycleItem.deleteMany({ payment: payment._id })

        return
        break
      case "DELETE":
        validate({ paymentId }).notEmpty()
        await CycleItem.deleteMany({ payment: payment._id })
        await payment.remove()

        return
        break
      default:
        throw new MethodNotAllowedException()
    }
  })
}
