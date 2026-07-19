import { useMutation } from "@tanstack/react-query"
import rest, { RestError } from "../rest"
import { ResetPasswordRequestData } from "../types/ResetPasswordRequestData"
import { ResetPasswordResponseData } from "../types/ResetPasswordResponseData"

export function useResetPassword() {
  return useMutation<
    ResetPasswordResponseData,
    RestError,
    ResetPasswordRequestData
  >({
    mutationFn: (req: ResetPasswordRequestData) =>
      rest.post(`/resetPassword`, req),
  })
}
