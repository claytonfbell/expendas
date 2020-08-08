import { NextApiResponse } from "next/dist/next-server/lib/utils"
import { HttpException } from "./HttpException"

export default async function buildResponse(
  res: NextApiResponse,
  func: () => void
) {
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
