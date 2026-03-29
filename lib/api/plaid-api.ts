import { useMutation, useQueryClient } from "@tanstack/react-query"
import { PlaidLinkOnSuccessMetadata } from "react-plaid-link"
import { LinkTokenRequest } from "../../pages/api/organizations/[id]/plaid/linkToken"
import { useGlobalState } from "../GlobalStateProvider"
import rest, { RestError } from "./rest"

interface CreateLinkTokenResponse {
  link_token: string
}

export function useCreateLinkToken() {
  const { organizationId } = useGlobalState()
  return useMutation<CreateLinkTokenResponse, RestError, LinkTokenRequest>({
    mutationFn: (params) =>
      rest.post(`/organizations/${organizationId}/plaid/linkToken`, params),
  })
}

export function useCreatePlaidCredential() {
  const { organizationId } = useGlobalState()
  return useMutation<
    void,
    RestError,
    { public_token: string; metadata: PlaidLinkOnSuccessMetadata }
  >({
    mutationFn: ({ public_token, metadata }) =>
      rest.post(`/organizations/${organizationId}/plaid/credential`, {
        public_token,
        metadata,
      }),
  })
}

export function useRefreshPlaidAccounts() {
  const queryClient = useQueryClient()
  const { organizationId } = useGlobalState()
  return useMutation<void, RestError>({
    mutationFn: () =>
      rest.post(`/organizations/${organizationId}/plaid/accounts`),
    onSuccess: () => {
      queryClient.refetchQueries({ queryKey: ["accounts", organizationId] })
    },
  })
}
