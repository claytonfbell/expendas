import { useMutation } from "@tanstack/react-query"
import rest, { RestError } from "../rest"
import { ForgotPasswordRequestData } from "../types/ForgotPasswordRequestData"
import { ForgotPasswordResponseData } from "../types/ForgotPasswordResponseData"

export function useForgotPassword() {
  return useMutation<
    ForgotPasswordResponseData,
    RestError,
    ForgotPasswordRequestData
  >({
    mutationFn: (req: ForgotPasswordRequestData) =>
      rest.post(`/forgotPassword`, req),
  })
}
