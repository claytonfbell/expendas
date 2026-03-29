import {
  Account,
  Item,
  Organization,
  Payment,
  User,
  UsersOnOrganizations,
} from "@prisma/client"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { TickerPriceResponse } from "../../pages/api/tickerPrices"
import { AccountWithIncludes } from "../AccountWithIncludes"
import { useGlobalState } from "../GlobalStateProvider"
import { ItemWithIncludes } from "../ItemWithIncludes"
import { PaymentWithIncludes } from "../PaymentWithIncludes"
import { AddOrganizationRequest } from "./AddOrganizationRequest"
import { AddUserRequest } from "./AddUserRequest"
import { ForgotPasswordRequest } from "./ForgotPasswordRequest"
import { ForgotPasswordResponse } from "./ForgotPasswordResponse"
import { LoginRequest } from "./LoginRequest"
import { LoginResponse } from "./LoginResponse"
import { RegisterRequest } from "./RegisterRequest"
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

  // accounts
  fetchAccounts: (organizationId: number) =>
    rest.get(`/organizations/${organizationId}/accounts`),
  addAccount: (req: Account) =>
    rest.post(`/organizations/${req.organizationId}/accounts`, req),
  fetchAccount: (organizationId: number, accountId: number) =>
    rest.get(`/organizations/${organizationId}/accounts/${accountId}`),
  updateAccount: (account: Account) =>
    rest.put(
      `/organizations/${account.organizationId}/accounts/${account.id}`,
      account
    ),
  removeAccount: (account: Account) =>
    rest.delete(
      `/organizations/${account.organizationId}/accounts/${account.id}`
    ),

  // payments
  fetchPayments: (organizationId: number) =>
    rest.get(`/organizations/${organizationId}/payments`),
  addPayment: (organizationId: number, req: Payment) =>
    rest.post(`/organizations/${organizationId}/payments`, req),
  fetchPayment: (organizationId: number, paymentId: number) =>
    rest.get(`/organizations/${organizationId}/payments/${paymentId}`),
  updatePayment: (organizationId: number, payment: Payment) =>
    rest.put(
      `/organizations/${organizationId}/payments/${payment.id}`,
      payment
    ),
  removePayment: (organizationId: number, payment: Payment) =>
    rest.delete(`/organizations/${organizationId}/payments/${payment.id}`),

  // dates
  fetchDates: (organizationId: number) =>
    rest.get(`/organizations/${organizationId}/dates`),

  // items
  fetchItems: (organizationId: number, date: string) =>
    rest.get(`/organizations/${organizationId}/dates/${date}`),
  updateItem: (organizationId: number, item: Item) =>
    rest.put(`/organizations/${organizationId}/items/${item.id}`, item),
}

export function useForgotPassword() {
  return useMutation<ForgotPasswordResponse, RestError, ForgotPasswordRequest>({
    mutationFn: api.forgotPassword,
  })
}

export function useResetPassword() {
  return useMutation<ResetPasswordResponse, RestError, ResetPasswordRequest>({
    mutationFn: api.resetPassword,
  })
}

export function useCheckLogin() {
  return useQuery<LoginResponse, RestError>({
    queryKey: ["login"],
    queryFn: api.checkLogin,
    retry: false,
  })
}

export function useLogin() {
  const queryClient = useQueryClient()
  return useMutation<LoginResponse, RestError, LoginRequest>({
    mutationFn: api.login,
    onSuccess: (data) => {
      queryClient.setQueryData(["login"], data)
    },
  })
}

export function useLogout() {
  const queryClient = useQueryClient()

  return useMutation<void, RestError>({
    mutationFn: api.logout,
    onSuccess: () => {
      queryClient.setQueryData(["login"], undefined)
    },
  })
}

export function useRegister() {
  const queryClient = useQueryClient()
  return useMutation<LoginResponse, RestError, RegisterRequest>({
    mutationFn: api.register,
    onSuccess: (data) => {
      queryClient.setQueryData(["login"], data)
    },
  })
}

export function useFetchOrganizations() {
  return useQuery<OrganizationWithIncludes[], RestError>({
    queryKey: ["organizations"],
    queryFn: api.fetchOrganizations,
  })
}

export function useFetchOrganization(organizationId: number) {
  return useQuery<OrganizationWithIncludes, RestError>({
    queryKey: ["organizations", organizationId],
    queryFn: () => api.fetchOrganization(organizationId),
  })
}

export function useUpdateOrganization() {
  const queryClient = useQueryClient()
  return useMutation<
    OrganizationWithIncludes,
    RestError,
    OrganizationWithIncludes
  >({
    mutationFn: api.updateOrganization,
    onSuccess: (data) => {
      const organizations = queryClient.getQueryData<
        OrganizationWithIncludes[]
      >(["organizations"])
      if (organizations !== undefined) {
        queryClient.setQueryData(["organizations"], [...organizations, data])
      }
      queryClient.setQueryData(["organizations", data.id], data)
      queryClient.refetchQueries({ queryKey: ["organizations"] })
    },
  })
}

export function useAddOrganization() {
  const queryClient = useQueryClient()
  return useMutation<
    OrganizationWithIncludes,
    RestError,
    AddOrganizationRequest
  >({
    mutationFn: api.addOrganization,
    onSuccess: (data) => {
      queryClient.setQueryData(["organizations", data.id], data)
      queryClient.refetchQueries({ queryKey: ["organizations"] })
    },
  })
}

export function useRemoveOrganization() {
  const queryClient = useQueryClient()
  return useMutation<void, RestError, number>({
    mutationFn: api.removeOrganization,
    onSuccess: () => {
      queryClient.refetchQueries({ queryKey: ["organizations"] })
    },
  })
}

export function useAddUser() {
  const queryClient = useQueryClient()

  return useMutation<OrganizationWithIncludes, RestError, AddUserRequest>({
    mutationFn: api.addUser,
    onSuccess: (data) => {
      queryClient.setQueryData(["organizations", data.id], data)
      queryClient.refetchQueries({ queryKey: ["organizations"] })
    },
  })
}

export function useRemoveUser() {
  const queryClient = useQueryClient()

  return useMutation<OrganizationWithIncludes, RestError, RemoveUserRequest>({
    mutationFn: api.removeUser,
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
      queryClient.refetchQueries({ queryKey: ["organizations"] })
    },
  })
}

// accounts
export function useFetchAccounts() {
  const { organizationId } = useGlobalState()

  return useQuery<AccountWithIncludes[], RestError>({
    queryKey: ["accounts", organizationId],
    queryFn: () => api.fetchAccounts(organizationId || 0),
    enabled: organizationId !== null,
    // refetchInterval: 65_000, // 65 seconds
  })
}

export function useFetchTickerPrices() {
  return useQuery<TickerPriceResponse, RestError>({
    queryKey: ["tickerPrices"],
    queryFn: () => rest.get(`/tickerPrices`),
  })
}

export function useAddAccount() {
  const queryClient = useQueryClient()

  return useMutation<Account, RestError, Account>({
    mutationFn: api.addAccount,
    onSuccess: (data) => {
      queryClient.setQueryData(["accounts", data.organizationId, data.id], data)
      queryClient.refetchQueries({ queryKey: ["accounts"] })
    },
  })
}

export function useFetchAccount(organizationId: number, accountId: number) {
  return useQuery<Account, RestError>({
    queryKey: ["accounts", organizationId, accountId],
    queryFn: () => api.fetchAccount(organizationId, accountId),
  })
}

export function useUpdateAccount() {
  const queryClient = useQueryClient()
  return useMutation<AccountWithIncludes, RestError, AccountWithIncludes>({
    mutationFn: api.updateAccount,
    // optimistic update
    onMutate: (data) => {
      const predicate = ["accounts", data.organizationId]
      const prev = queryClient.getQueryData<Account[] | undefined>(predicate)
      if (prev !== undefined) {
        queryClient.setQueryData<Account[] | undefined>(predicate, [
          ...prev.map((x) => {
            if (x.id === data.id) {
              return data
            }
            return x
          }),
        ])
      }
      return () =>
        queryClient.setQueryData<Account[] | undefined>(predicate, prev)
    },
    onError: (err, newOrg, rollback) => {
      // @ts-ignore
      rollback()
    },

    onSuccess: (data) => {
      queryClient.setQueryData(["accounts", data.organizationId, data.id], data)
      queryClient.refetchQueries({ queryKey: ["accounts"] })
    },
  })
}

export function useRemoveAccount() {
  const queryClient = useQueryClient()
  return useMutation<void, RestError, Account>({
    mutationFn: api.removeAccount,
    onSuccess: () => {
      queryClient.refetchQueries({ queryKey: ["accounts"] })
    },
  })
}

// payments
export function useFetchPayments(organizationId: number | null) {
  return useQuery<PaymentWithIncludes[], RestError>({
    queryKey: ["payments", organizationId],
    queryFn: () => api.fetchPayments(organizationId || 0),
    enabled: organizationId !== null,
  })
}

export function useAddPayment() {
  const { organizationId } = useGlobalState()
  const queryClient = useQueryClient()

  return useMutation<Payment, RestError, Payment>({
    mutationFn: (params) => api.addPayment(organizationId || 0, params),
    onSuccess: (data) => {
      queryClient.setQueryData(["payments", organizationId, data.id], data)
      queryClient.refetchQueries({ queryKey: ["payments"] })
      queryClient.refetchQueries({ queryKey: ["items"] })
    },
  })
}

export function useFetchPayment(organizationId: number, paymentId: number) {
  return useQuery<PaymentWithIncludes, RestError>({
    queryKey: ["payments", organizationId, paymentId],
    queryFn: () => api.fetchPayment(organizationId, paymentId),
  })
}

export function useUpdatePayment() {
  const { organizationId } = useGlobalState()

  const queryClient = useQueryClient()
  return useMutation<Payment, RestError, Payment>({
    mutationFn: (params) => api.updatePayment(organizationId || 0, params),
    // optimistic update
    onMutate: (data) => {
      const predicate = ["payments", organizationId]
      const prev = queryClient.getQueryData<Payment[] | undefined>(predicate)
      if (prev !== undefined) {
        queryClient.setQueryData<Payment[] | undefined>(predicate, [
          ...prev.map((x) => {
            if (x.id === data.id) {
              return data
            }
            return x
          }),
        ])
      }
      return () =>
        queryClient.setQueryData<Payment[] | undefined>(predicate, prev)
    },
    onError: (err, newOrg, rollback) => {
      // @ts-ignore
      rollback()
    },

    onSuccess: (data) => {
      queryClient.setQueryData(["payments", organizationId, data.id], data)
      queryClient.refetchQueries({ queryKey: ["payments"] })
      queryClient.refetchQueries({ queryKey: ["items"] })
    },
  })
}

export function useRemovePayment() {
  const { organizationId } = useGlobalState()

  const queryClient = useQueryClient()
  return useMutation<void, RestError, Payment>({
    mutationFn: (params) => api.removePayment(organizationId || 0, params),
    onSuccess: () => {
      queryClient.refetchQueries({ queryKey: ["payments"] })
    },
  })
}

export function useFetchDates() {
  const { organizationId } = useGlobalState()

  return useQuery<string[], RestError>({
    queryKey: ["dates", organizationId],
    queryFn: () => api.fetchDates(organizationId || 0),
    enabled: organizationId !== null,
  })
}

export function useFetchItems(date: string | null) {
  const { organizationId } = useGlobalState()

  return useQuery<ItemWithIncludes[], RestError>({
    queryKey: ["items", organizationId, date],
    queryFn: () => api.fetchItems(organizationId || 0, date || ""),
    enabled: organizationId !== null && date !== null,
  })
}

export function useUpdateItem() {
  const { organizationId } = useGlobalState()
  const queryClient = useQueryClient()

  return useMutation<Item, RestError, Item>({
    mutationFn: (params) => api.updateItem(organizationId || 0, params),
    // optimistic update
    onMutate: (data) => {
      const predicate = ["items", organizationId, data.date]
      const prev = queryClient.getQueryData<Item[] | undefined>(predicate)
      if (prev !== undefined) {
        queryClient.setQueryData<Item[] | undefined>(predicate, [
          ...prev.map((x) => {
            if (x.id === data.id) {
              return data
            }
            return x
          }),
        ])
      }
      return () => queryClient.setQueryData<Item[] | undefined>(predicate, prev)
    },
    onError: (err, newOrg, rollback) => {
      // @ts-ignore
      rollback()
    },

    onSuccess: (data) => {
      queryClient.setQueryData(["items", organizationId, data.id], data)
      queryClient.refetchQueries({ queryKey: ["items"] })
    },
  })
}
