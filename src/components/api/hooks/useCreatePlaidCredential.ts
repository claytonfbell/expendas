import { useMutation } from "@tanstack/react-query"
import { PlaidLinkOnSuccessMetadata } from "react-plaid-link"
import { useGlobalState } from "../../GlobalStateContext"
import rest, { RestError } from "../rest"

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
