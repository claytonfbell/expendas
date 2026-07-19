import { useMutation } from "@tanstack/react-query"
import type { LinkTokenRequest } from "../../../app/api/organizations.$id.plaid.linkToken"
import { useGlobalState } from "../../GlobalStateContext"
import rest, { RestError } from "../rest"
import { CreateLinkTokenResponseData } from "../types/CreateLinkTokenResponseData"

export function useCreateLinkToken() {
  const { organizationId } = useGlobalState()
  return useMutation<CreateLinkTokenResponseData, RestError, LinkTokenRequest>({
    mutationFn: (params) =>
      rest.post(`/organizations/${organizationId}/plaid/linkToken`, params),
  })
}
