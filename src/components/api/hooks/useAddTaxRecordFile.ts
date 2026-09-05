import { TaxRecordFile, OrganizationCloudFile, CloudFile } from "@prisma/client"
import { QUERY_KEYS } from "./queryKeys"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import rest, { RestError } from "../rest"
import { useGlobalState } from "../../GlobalStateContext"

export type TaxRecordFileWithIncludes = TaxRecordFile & {
  organizationCloudFile: OrganizationCloudFile & {
    cloudFile: CloudFile
  }
}

export function useAddTaxRecordFile() {
  const { organizationId } = useGlobalState()
  const queryClient = useQueryClient()
  return useMutation<
    TaxRecordFileWithIncludes,
    RestError,
    {
      taxRecordId: number
      fileName: string
      fileContentType: string
      fileBase64: string
    }
  >({
    mutationFn: (params) =>
      rest.post(
        `/organizations/${organizationId}/taxRecords/${params.taxRecordId}/files`,
        {
          fileName: params.fileName,
          fileContentType: params.fileContentType,
          fileBase64: params.fileBase64,
        }
      ),
    onSuccess: () => {
      queryClient.refetchQueries({
        queryKey: [QUERY_KEYS.TAX_RECORDS, organizationId],
      })
    },
  })
}