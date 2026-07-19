import { QUERY_KEYS } from "./queryKeys"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import rest, { RestError } from "../rest"
import { LoginRequestData } from "../types/LoginRequestData"
import { LoginResponseData } from "../types/LoginResponseData"

export function useLogin() {
  const queryClient = useQueryClient()
  return useMutation<LoginResponseData, RestError, LoginRequestData>({
    mutationFn: (req: LoginRequestData) => rest.post(`/login`, req),
    onSuccess: (data) => {
      queryClient.setQueryData([QUERY_KEYS.LOGIN], data)
    },
  })
}
