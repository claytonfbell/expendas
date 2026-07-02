import { User } from "@prisma/client"

export interface LoginResponse {
  user: User
  isSuperAdmin: boolean
}
