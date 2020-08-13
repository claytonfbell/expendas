import Account from "../../../src/db/Account"
import { MethodNotAllowedException } from "../../../src/exceptions/HttpException"
import applyMiddleware, {
  NextApiRequestApplied,
  NextApiResponseApplied,
} from "../../../src/middleware/applyMiddleware"

export default async (
  req: NextApiRequestApplied,
  res: NextApiResponseApplied
) => {
  await applyMiddleware(req, res)
  res.build(async () => {
    switch (req.method) {
      case "GET":
        const allAccounts = Account.find({ household: req.household._id })
        return allAccounts
        break
      default:
        throw new MethodNotAllowedException()
    }
  })
}
