import bcrypt from "bcrypt"
import {
  BadRequestException,
  MethodNotAllowedException,
  UnauthorizedException,
} from "../../src/exceptions/HttpException"
import applyMiddleware, {
  NextApiRequestApplied,
  NextApiResponseApplied,
} from "../../src/middleware/applyMiddleware"
import ExpendasSessionData from "../../src/model/ExpendasSessionData"
import Household from "../../src/model/Household"
import { SignInRequest } from "../../src/model/SignInRequest"
import User from "../../src/model/User"
import validate from "../../src/util/validate"

export default async (
  req: NextApiRequestApplied,
  res: NextApiResponseApplied
) => {
  await applyMiddleware(req, res)
  res.build(async () => {
    switch (req.method) {
      case "GET":
        const signedInUser = await User.findOne({
          _id: req.session.data.userId,
        })
        if (signedInUser === null) {
          throw new UnauthorizedException()
        }
        return req.session.data
        break
      case "DELETE":
        delete req.session.data
        await req.session.commit()
        return
        break
      case "POST":
        const { email, password }: SignInRequest = req.body

        validate({ email }).min(1)
        validate({ password }).min(1)

        const exists = await User.findOne({ email: email.toLowerCase() })
        if (exists === null) {
          throw new BadRequestException(
            `Account not registered with username and password.`
          )
        }
        if (!bcrypt.compareSync(password, exists.passwordHash)) {
          throw new BadRequestException(
            `Account not registered with username and password.`
          )
        }

        // Select / Create Household
        let household = await Household.findOne({
          members: { $in: [exists._id] },
        })

        // create new household if none exists
        if (household === null) {
          household = await Household.create({
            name: exists.firstName + " Home",
            members: [exists._id],
          })
        }

        // session here
        const data: ExpendasSessionData = {
          userId: exists.id,
          householdId: household.id,
        }
        req.session.data = data

        await req.session.commit()

        req.mongoose.disconnect()

        return req.session.data
        break
      default:
        throw new MethodNotAllowedException()
    }
  })
}
