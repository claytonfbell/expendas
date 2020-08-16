import Account, { IAccount } from "../../../src/db/Account"
import { MethodNotAllowedException } from "../../../src/exceptions/HttpException"
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
      case "GET":
        const allAccounts = await Account.find({ household: req.household._id })
        return allAccounts.sort(
          (a, b) => Math.abs(b.currentBalance) - Math.abs(a.currentBalance)
        )
        break
      case "POST":
        const {
          name,
          type,
          creditCardType,
          currentBalance,
        }: IAccount = req.body

        validate({ name }).notEmpty()
        validate({ type }).notEmpty()
        if (type === "Credit Card") {
          validate({ creditCardType }).notEmpty()
        }
        validate({ currentBalance }).notNull()

        return await Account.create({
          household: req.household._id,
          name,
          type,
          creditCardType,
          currentBalance,
          carryOver: [],
        })
        break
      default:
        throw new MethodNotAllowedException()
    }
  })
}
