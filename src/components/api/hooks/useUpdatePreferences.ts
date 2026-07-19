import { UpdatePreferencesRequestData } from "../types/UpdatePreferencesRequestData"
import { QUERY_KEYS } from "./queryKeys"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import rest, { RestError } from "../rest"

export function useUpdatePreferences() {
  const queryClient = useQueryClient()
  return useMutation<void, RestError, UpdatePreferencesRequestData>({
    mutationFn: (data) => rest.put("/user/preferences", data),
    onSuccess: () => {
      queryClient.refetchQueries({
        queryKey: [QUERY_KEYS.USER_PREFERENCES],
      })
    },
  })
}
