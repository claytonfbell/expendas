import {
  BadRequestException,
  MethodNotAllowedException,
} from "../../../src/exceptions/HttpException"
import applyMiddleware, {
  NextApiRequestApplied,
  NextApiResponseApplied,
} from "../../../src/middleware/applyMiddleware"
import Payment from "../../../src/model/Payment"
import validate from "../../../src/util/validate"

export default async (
  req: NextApiRequestApplied,
  res: NextApiResponseApplied
) => {
  await applyMiddleware(req, res)
  res.build(async () => {
    switch (req.method) {
      case "DELETE":
        const {
          query: { paymentId },
        } = req

        validate({ paymentId }).notEmpty()

        const payment = await Payment.findOne({
          household: req.household._id,
          _id: paymentId,
        })
        if (payment === null) {
          throw new BadRequestException(`No payment found with id ${paymentId}`)
        }

        await payment.remove()

        return
        break
      default:
        throw new MethodNotAllowedException()
    }
  })
}
