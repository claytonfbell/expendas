import {
  ApiKey,
  Organization,
  Ping,
  User,
  UsersOnOrganizations,
} from "@prisma/client"
import { useMutation, useQuery, useQueryClient } from "react-query"
import { AddApiKeyRequest } from "./AddApiKeyRequest"
import { AddOrganizationRequest } from "./AddOrganizationRequest"
import { AddUserRequest } from "./AddUserRequest"
import { FetchMonitorItemResponse } from "./FetchMonitorItemResponse"
import { ForgotPasswordRequest } from "./ForgotPasswordRequest"
import { ForgotPasswordResponse } from "./ForgotPasswordResponse"
import { LoginRequest } from "./LoginRequest"
import { LoginResponse } from "./LoginResponse"
import { MonitorResponse } from "./MonitorResponse"
import { PingRequest } from "./PingRequest"
import { RegisterRequest } from "./RegisterRequest"
import { RemoveApiKeyRequest } from "./RemoveApiKeyRequest"
import { RemoveUserRequest } from "./RemoveUserRequest"
import { ResetPasswordRequest } from "./ResetPasswordRequest"
import { ResetPasswordResponse } from "./ResetPasswordResponse"
import rest, { RestError } from "./rest"

rest.setBaseURL(`/api`)

export type OrganizationWithIncludes = Organization & {
  users: UsersOnOrganizationsWithUser[]
  apiKeys: ApiKey[]
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
  ping: (req: PingRequest) => rest.post(`/ping`, req),
  fetchMonitor: (organizationId: number | null) =>
    rest.get(`/monitor`, { organizationId }),
  fetchMonitorItem: (pingSetupId: number | null) =>
    rest.get(`/monitor/${pingSetupId}`),
  deleteMonitorItem: ({ pingSetupId }: DeleteMonitorItemParams) =>
    rest.delete(`/monitor/${pingSetupId}`),
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

export function useAddApiKey() {
  const queryClient = useQueryClient()

  return useMutation<OrganizationWithIncludes, RestError, AddApiKeyRequest>(
    api.addApiKey,
    {
      onSuccess: (data) => {
        queryClient.setQueryData(["organizations", data.id], data)
        queryClient.refetchQueries("organizations")
      },
    }
  )
}

export function useRemoveApiKey() {
  const queryClient = useQueryClient()

  return useMutation<OrganizationWithIncludes, RestError, RemoveApiKeyRequest>(
    api.removeApiKey,
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
              apiKeys: prevOrg.apiKeys.filter((x) => x.id !== data.apiKeyId),
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

export function usePing() {
  const queryClient = useQueryClient()

  return useMutation<Ping, RestError, PingRequest>(api.ping, {
    onSuccess: () => {
      queryClient.refetchQueries("monitor")
    },
  })
}

export function useFetchMonitor(organizationId: number | null) {
  const queryClient = useQueryClient()

  return useQuery<MonitorResponse, RestError>(
    ["monitor", organizationId],
    () => api.fetchMonitor(organizationId),
    { enabled: organizationId !== null, refetchInterval: 20000 }
  )
}

export function useFetchMonitorItem(pingSetupId: number | null) {
  return useQuery<FetchMonitorItemResponse, RestError>(
    ["pings", pingSetupId],
    () => api.fetchMonitorItem(pingSetupId),
    { enabled: pingSetupId !== null, refetchInterval: 20000 }
  )
}

type DeleteMonitorItemParams = {
  pingSetupId: number
  organizationId: number
}

export function useDeleteMonitorItem() {
  const queryClient = useQueryClient()

  return useMutation<void, RestError, DeleteMonitorItemParams>(
    api.deleteMonitorItem,
    {
      // optimistic update
      onMutate: ({ organizationId, pingSetupId }) => {
        const predicate = ["monitor", organizationId]
        const prevMonitor = queryClient.getQueryData<
          MonitorResponse | undefined
        >(predicate)
        if (prevMonitor !== undefined) {
          queryClient.setQueryData<MonitorResponse | undefined>(predicate, {
            ...prevMonitor,
            groups: [...prevMonitor.groups].map((group) => ({
              ...group,
              items: [...group.items].filter(
                (item) => item.pingSetup.id !== pingSetupId
              ),
            })),
          })
        }
        return () =>
          queryClient.setQueryData<MonitorResponse | undefined>(
            predicate,
            prevMonitor
          )
      },
      onError: (err, newOrg, rollback) => {
        // @ts-ignore
        rollback()
      },
      onSuccess: () => {
        queryClient.refetchQueries("monitor")
      },
    }
  )
}
