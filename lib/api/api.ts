import { Organization, User, UsersOnOrganizations } from "@prisma/client"
import { useMutation, useQuery, useQueryClient } from "react-query"
import { AddApiKeyRequest } from "./AddApiKeyRequest"
import { AddOrganizationRequest } from "./AddOrganizationRequest"
import { AddUserRequest } from "./AddUserRequest"
import { ForgotPasswordRequest } from "./ForgotPasswordRequest"
import { ForgotPasswordResponse } from "./ForgotPasswordResponse"
import { LoginRequest } from "./LoginRequest"
import { LoginResponse } from "./LoginResponse"
import { RegisterRequest } from "./RegisterRequest"
import { RemoveApiKeyRequest } from "./RemoveApiKeyRequest"
import { RemoveUserRequest } from "./RemoveUserRequest"
import { ResetPasswordRequest } from "./ResetPasswordRequest"
import { ResetPasswordResponse } from "./ResetPasswordResponse"
import rest, { RestError } from "./rest"

rest.setBaseURL(`/api`)

export type OrganizationWithIncludes = Organization & {
  users: UsersOnOrganizationsWithUser[]
}

type UsersOnOrganizationsWithUser = UsersOnOrganizations & {
  user: User
}

const api = {
  forgotPassword: (req: ForgotPasswordRequest) =>
    rest.post(`/forgotPassword`, req),
  resetPassword: (req: ResetPasswordRequest) =>
    rest.post(`/resetPassword`, req),
  checkLogin: () => rest.get(`/login`),
  login: (req: LoginRequest) => rest.post(`/login`, req),
  logout: () => rest.delete(`/login`),
  register: (req: RegisterRequest) => rest.post(`/register`, req),
  fetchOrganizations: () => rest.get(`/organizations`),
  fetchOrganization: (organizationId: number) =>
    rest.get(`/organizations/${organizationId}`),
  updateOrganization: (organization: OrganizationWithIncludes) =>
    rest.put(`/organizations/${organization.id}`, organization),
  addOrganization: (req: AddOrganizationRequest) =>
    rest.post(`/organizations`, req),
  removeOrganization: (organizationId: number) =>
    rest.delete(`/organizations/${organizationId}`),
  addUser: (req: AddUserRequest) => rest.post(`/organizations/addUser`, req),
  removeUser: (req: RemoveUserRequest) =>
    rest.post(`/organizations/removeUser`, req),
  addApiKey: (req: AddApiKeyRequest) =>
    rest.post(`/organizations/addApiKey`, req),
  removeApiKey: (req: RemoveApiKeyRequest) =>
    rest.post(`/organizations/removeApiKey`, req),
}

export function useForgotPassword() {
  return useMutation<ForgotPasswordResponse, RestError, ForgotPasswordRequest>(
    api.forgotPassword
  )
}

export function useResetPassword() {
  return useMutation<ResetPasswordResponse, RestError, ResetPasswordRequest>(
    api.resetPassword
  )
}

export function useCheckLogin() {
  return useQuery<LoginResponse, RestError>(["login"], api.checkLogin, {
    retry: false,
  })
}

export function useLogin() {
  const queryClient = useQueryClient()
  return useMutation<LoginResponse, RestError, LoginRequest>(api.login, {
    onSuccess: (data) => {
      queryClient.setQueryData(["login"], data)
    },
  })
}

export function useLogout() {
  const queryClient = useQueryClient()

  return useMutation<void, RestError>(api.logout, {
    onSuccess: () => {
      queryClient.setQueryData(["login"], undefined)
    },
  })
}

export function useRegister() {
  const queryClient = useQueryClient()
  return useMutation<LoginResponse, RestError, RegisterRequest>(api.register, {
    onSuccess: (data) => {
      queryClient.setQueryData(["login"], data)
    },
  })
}

export function useFetchOrganizations() {
  return useQuery<OrganizationWithIncludes[], RestError>(
    ["organizations"],
    api.fetchOrganizations
  )
}

export function useFetchOrganization(organizationId: number) {
  return useQuery<OrganizationWithIncludes, RestError>(
    ["organizations", organizationId],
    () => api.fetchOrganization(organizationId)
  )
}

export function useUpdateOrganization() {
  const queryClient = useQueryClient()
  return useMutation<
    OrganizationWithIncludes,
    RestError,
    OrganizationWithIncludes
  >(api.updateOrganization, {
    onSuccess: (data) => {
      queryClient.setQueryData(["organizations", data.id], data)
      queryClient.refetchQueries("organizations")
    },
  })
}

export function useAddOrganization() {
  const queryClient = useQueryClient()
  return useMutation<
    OrganizationWithIncludes,
    RestError,
    AddOrganizationRequest
  >(api.addOrganization, {
    onSuccess: (data) => {
      queryClient.setQueryData(["organizations", data.id], data)
      queryClient.refetchQueries("organizations")
    },
  })
}

export function useRemoveOrganization() {
  const queryClient = useQueryClient()
  return useMutation<void, RestError, number>(api.removeOrganization, {
    onSuccess: () => {
      queryClient.refetchQueries("organizations")
    },
  })
}

export function useAddUser() {
  const queryClient = useQueryClient()

  return useMutation<OrganizationWithIncludes, RestError, AddUserRequest>(
    api.addUser,
    {
      onSuccess: (data) => {
        queryClient.setQueryData(["organizations", data.id], data)
        queryClient.refetchQueries("organizations")
      },
    }
  )
}

export function useRemoveUser() {
  const queryClient = useQueryClient()

  return useMutation<OrganizationWithIncludes, RestError, RemoveUserRequest>(
    api.removeUser,
    {
      // optimistic update
      onMutate: (data) => {
        const predicate = ["organizations", data.organizationId]
        const prevOrg = queryClient.getQueryData<
          OrganizationWithIncludes | undefined
        >(predicate)
        if (prevOrg !== undefined) {
          queryClient.setQueryData<OrganizationWithIncludes | undefined>(
            predicate,
            {
              ...prevOrg,
              users: prevOrg.users.filter((x) => x.userId !== data.userId),
            }
          )
        }
        return () =>
          queryClient.setQueryData<OrganizationWithIncludes | undefined>(
            predicate,
            prevOrg
          )
      },
      onError: (err, newOrg, rollback) => {
        // @ts-ignore
        rollback()
      },
      onSuccess: (data) => {
        queryClient.setQueryData(["organizations", data.id], data)
        queryClient.refetchQueries("organizations")
      },
    }
  )
}
