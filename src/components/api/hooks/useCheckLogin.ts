import { QUERY_KEYS } from "./queryKeys"
import { useQuery } from "@tanstack/react-query"
import rest, { RestError } from "../rest"
import { LoginResponseData } from "../types/LoginResponseData"

export function useCheckLogin() {
  return useQuery<LoginResponseData, RestError>({
    queryKey: [QUERY_KEYS.LOGIN],
    queryFn: () => rest.get(`/login`),
    retry: false,
  })
}