import { Organization, User, UsersOnOrganizations } from "@prisma/client"

type UsersOnOrganizationsWithUser = UsersOnOrganizations & {
  user: User
}

export type OrganizationWithIncludes = Organization & {
  users: UsersOnOrganizationsWithUser[]
}
