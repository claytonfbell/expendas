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
        const signedInUser = await User.findOne({ _id: req.session.userId })
        if (signedInUser === null) {
          throw new UnauthorizedException()
        }
        return signedInUser
        break
      case "DELETE":
        delete req.session.userId
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

        // todo set session cookie here
        req.session.userId = exists.id
        await req.session.commit()

        req.mongoose.disconnect()

        return exists
        break
      default:
        throw new MethodNotAllowedException()
    }
  })
}
