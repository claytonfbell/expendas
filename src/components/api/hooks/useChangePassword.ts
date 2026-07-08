import { ChangePasswordRequestData } from "../types/ChangePasswordRequestData"
import { useMutation } from "@tanstack/react-query"
import rest, { RestError } from "../rest"

export function useChangePassword() {
  return useMutation<void, RestError, ChangePasswordRequestData>({
    mutationFn: (data) => rest.put("/user/password", data),
  })
}