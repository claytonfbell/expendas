import { QUERY_KEYS } from "./queryKeys"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import rest, { RestError } from "../rest"
import { LoginResponseData } from "../types/LoginResponseData"
import { RegisterRequestData } from "../types/RegisterRequestData"

export function useRegister() {
  const queryClient = useQueryClient()
  return useMutation<LoginResponseData, RestError, RegisterRequestData>({
    mutationFn: (req: RegisterRequestData) => rest.post(`/register`, req),
    onSuccess: (data) => {
      queryClient.setQueryData([QUERY_KEYS.LOGIN], data)
    },
  })
}