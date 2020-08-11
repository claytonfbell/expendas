import {
  BadRequestException,
  MethodNotAllowedException,
} from "../../../src/exceptions/HttpException"
import applyMiddleware, {
  NextApiRequestApplied,
  NextApiResponseApplied,
} from "../../../src/middleware/applyMiddleware"
import CycleItem, { ICycleItem } from "../../../src/model/CycleItem"
import validate from "../../../src/util/validate"

export default async (
  req: NextApiRequestApplied,
  res: NextApiResponseApplied
) => {
  await applyMiddleware(req, res)
  res.build(async () => {
    const {
      query: { cycleItemId },
    } = req
    const cycleItem = await CycleItem.findOne({
      household: req.household._id,
      _id: cycleItemId,
    })
    if (cycleItem === null) {
      throw new BadRequestException(`No cycleItem found with id ${cycleItemId}`)
    }

    switch (req.method) {
      case "PUT":
        const { amount, isPaid }: ICycleItem = req.body

        validate({ amount }).notEmpty()

        cycleItem.amount = amount
        cycleItem.isPaid = isPaid === true
        await cycleItem.save()

        return
        break
      default:
        throw new MethodNotAllowedException()
    }
  })
}
