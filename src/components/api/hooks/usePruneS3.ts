import { useMutation } from "@tanstack/react-query"
import rest, { RestError } from "../rest"

export interface PrunedFile {
  key: string
  originalName: string | null
  size: number
  reason: "orphaned" | "marked-deleted"
}

export interface PruneS3Result {
  totalScanned: number
  deletedCount: number
  keptCount: number
  deletedFiles: PrunedFile[]
}

export function usePruneS3() {
  return useMutation<PruneS3Result, RestError, void>({
    mutationFn: () => rest.post(`/cloud-files/prune-s3`),
  })
}
