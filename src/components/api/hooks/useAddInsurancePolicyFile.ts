import { InsurancePolicyFile, OrganizationCloudFile, CloudFile } from "@prisma/client"
import { QUERY_KEYS } from "./queryKeys"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import rest, { RestError } from "../rest"
import { useGlobalState } from "../../GlobalStateContext"

export type InsurancePolicyFileWithIncludes = InsurancePolicyFile & {
  organizationCloudFile: OrganizationCloudFile & {
    cloudFile: CloudFile
  }
}

export function useAddInsurancePolicyFile() {
  const { organizationId } = useGlobalState()
  const queryClient = useQueryClient()
  return useMutation<
    InsurancePolicyFileWithIncludes,
    RestError,
    {
      insurancePolicyId: number
      fileName: string
      fileContentType: string
      fileBase64: string
    }
  >({
    mutationFn: (params) =>
      rest.post(
        `/organizations/${organizationId}/insurancePolicies/${params.insurancePolicyId}/files`,
        {
          fileName: params.fileName,
          fileContentType: params.fileContentType,
          fileBase64: params.fileBase64,
        }
      ),
    onSuccess: () => {
      queryClient.refetchQueries({
        queryKey: [QUERY_KEYS.INSURANCE_POLICIES, organizationId],
      })
    },
  })
}