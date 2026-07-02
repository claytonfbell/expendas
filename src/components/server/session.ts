import { SessionOptions } from "iron-session"
import { User } from "@prisma/client"

export interface SessionData {
  user?: User
}

export const sessionOptions: SessionOptions = {
  password:
    process.env.SECRET_COOKIE_PASSWORD || "GzPWLYyiDT8Rx6NAn@rrNm-oR2LxH3ow",
  cookieName: "expendas-session",
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
  },
}
