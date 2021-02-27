import Account, { IAccount } from "../../../src/db/Account"
import CycleItem from "../../../src/db/CycleItem"
import Payment from "../../../src/db/Payment"
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
      query: { accountId },
    } = req
    const account = await Account.findOne({
      household: req.household._id,
      _id: accountId,
    })
    if (account === null) {
      throw new BadRequestException(`No account found with id ${accountId}`)
    }

    switch (req.method) {
      case "PUT":
        const {
          name,
          type,
          creditCardType,
          currentBalance,
          carryOver,
          sortBy,
        }: IAccount = req.body

        validate({ name }).notEmpty()
        validate({ type }).notEmpty()
        if (type === "Credit Card") {
          validate({ creditCardType }).notEmpty()
        }
        validate({ currentBalance }).notNull()

        // throw new BadRequestException(`currentBalance ${currentBalance}`)

        account.name = name
        account.type = type
        account.creditCardType = creditCardType
        account.currentBalance = currentBalance
        account.carryOver = carryOver
        account.sortBy = sortBy || 0
        console.log(account.currentBalance)
        await account.save()

        return
        break
      case "DELETE":
        const payments = await Payment.find({
          account: account._id,
        })
        payments.forEach(async (payment) => {
          await CycleItem.deleteMany({ payment: payment._id })
          await Payment.deleteOne({ _id: payment._id })
        })

        await account.remove()

        return
        break
      default:
        throw new MethodNotAllowedException()
    }
  })
}
