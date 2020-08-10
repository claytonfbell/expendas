import ConnectMongo from "connect-mongo"
import mongoose, { Mongoose } from "mongoose"
import { NextApiRequest, NextApiResponse } from "next"
import { applySession, expressSession, promisifyStore } from "next-session"
import { HttpException } from "../exceptions/HttpException"
import Account from "../model/Account"
import Payment from "../model/Payment"
import User from "../model/User"

export type NextApiRequestApplied = NextApiRequest & {
  session: any
  mongoose: Mongoose
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
