import ConnectMongo from "connect-mongo"
import mongoose, { Mongoose } from "mongoose"
import { NextApiRequest, NextApiResponse } from "next"
import {
  applySession,
  expressSession,
  promisifyStore,
  SessionStore,
} from "next-session"
import Account from "../db/Account"
import Household, { IHousehold } from "../db/Household"
import Payment from "../db/Payment"
import User, { IUser } from "../db/User"
import { HttpException } from "../exceptions/HttpException"
import ExpendasSessionData from "../model/ExpendasSessionData"

export type NextApiRequestApplied = NextApiRequest & {
  session: SessionStore
  mongoose: Mongoose
  user?: IUser
  household?: IHousehold
}

export type NextApiResponseApplied = NextApiResponse & {
  build: (func: () => void) => {}
}

export default async function applyMiddleware(
  req: NextApiRequestApplied,
  res: NextApiResponseApplied
) {
  const MongoStore = ConnectMongo(expressSession)

  // apply session
  await applySession(req, res, {
    cookie: { secure: false, httpOnly: true },
    name: "EXPENDA-SESSION",
    autoCommit: false,
    store: promisifyStore(new MongoStore({ url: process.env.mongodb })),
  })

  // apply mongoose connection
  await mongoose.connect(process.env.mongodb, {
    useNewUrlParser: true,
    bufferCommands: false,
    bufferMaxEntries: 0,
    useUnifiedTopology: true,
  })
  req.mongoose = mongoose

  // importing so they are all available
  User
  Account
  Payment

  // attach user and household
  const sessionData: ExpendasSessionData = req.session.data
  if (sessionData !== undefined && sessionData !== null) {
    req.user = await User.findOne({
      _id: sessionData.userId,
    })
    req.household = await Household.findOne({
      _id: sessionData.householdId,
    })
    // moment.tz.setDefault(req.user.timeZone)
  }

  // apply build function
  res.build = async (func: () => void) => {
    try {
      const result = await func()
      if (result === undefined) {
        res.status(204).send(null)
      } else {
        res.status(200).json(result)
      }
    } catch (e) {
      console.log(e)
      if (e instanceof HttpException) {
        res.status(e.status).json(e)
      } else {
        res
          .status(500)
          .json({ status: 500, message: "Unexpected Internal Server Error" })
      }
    }
  }
}
