// this file is a wrapper with defaults to be used in both API routes and `getServerSideProps` functions
import { NextApiRequest, NextApiResponse } from "next"
import { Session, withIronSession } from "next-iron-session"

// optionally add stronger typing for next-specific implementation
export type NextIronRequest = NextApiRequest & { session: Session }
export type NextIronHandler = (
  req: NextIronRequest,
  res: NextApiResponse
) => void | Promise<void>

const withSession = (handler: NextIronHandler) =>
  withIronSession(handler, {
    password:
      process.env.SECRET_COOKIE_PASSWORD || "GzPWLYyiDT8Rx6NAn@rrNm-oR2LxH3ow",
    cookieName: "expendas-session",
    cookieOptions: {
      // the next line allows to use the session in non-https environments like
      // Next.js dev mode (http://localhost:3000)
      secure: process.env.NODE_ENV === "production",
    },
  })

export default withSession
