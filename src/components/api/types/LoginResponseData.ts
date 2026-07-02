import { User } from "@prisma/client"

export interface LoginResponseData {
  user: User
  isSuperAdmin: boolean
}
