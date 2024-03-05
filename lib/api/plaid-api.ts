import { PlaidLinkOnSuccessMetadata } from "react-plaid-link"
import { useMutation, useQueryClient } from "react-query"
import { useGlobalState } from "../GlobalStateProvider"
import rest, { RestError } from "./rest"

interface CreateLinkTokenResponse {
  link_token: string
}

export function useCreateLinkToken() {
  const { organizationId } = useGlobalState()
  return useMutation<CreateLinkTokenResponse, RestError>(() =>
    rest.post(`/organizations/${organizationId}/plaid/linkToken`)
  )
}

export function useCreatePlaidCredential() {
  const { organizationId } = useGlobalState()
  return useMutation<
    void,
    RestError,
    { public_token: string; metadata: PlaidLinkOnSuccessMetadata }
  >(({ public_token, metadata }) =>
    rest.post(`/organizations/${organizationId}/plaid/credential`, {
      public_token,
      metadata,
    })
  )
}

export function useRefreshPlaidAccounts() {
  const queryClient = useQueryClient()
  const { organizationId } = useGlobalState()
  return useMutation<void, RestError>(
    () => rest.post(`/organizations/${organizationId}/plaid/accounts`),
    {
      onSuccess: () => {
        queryClient.refetchQueries({ queryKey: ["accounts", organizationId] })
      },
    }
  )
}
