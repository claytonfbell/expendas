import { queryCache, useMutation } from "react-query"
import { IPayment } from "../db/Payment"
import rest, { RestError } from "../rest"
import { usePersistedQuery } from "./usePersistedData"

const KEY = "payments"

const api = {
  fetchPayments: (): Promise<IPayment[]> => rest.get("/payments"),
  createPayment: (params: IPayment): Promise<IPayment> => {
    return rest.post("/payments", params)
  },
  updatePayment: (payment: IPayment): Promise<IPayment> =>
    rest.put(`/payments/${payment._id}`, payment),
  deletePayment: (paymentId: string) => rest.delete(`/payments/${paymentId}`),
}

export function useFetchPayments() {
  return usePersistedQuery<IPayment[]>(KEY, api.fetchPayments, {
    initialData: [],
    initialStale: true,
  })
}

export function useCreatePayment() {
  return useMutation<IPayment, RestError, IPayment>(api.createPayment, {
    onSuccess: () => queryCache.invalidateQueries(KEY),
    throwOnError: true,
  })
}

export function useUpdatePayment() {
  return useMutation<IPayment, RestError, IPayment>(api.updatePayment, {
    onMutate: (newData) => {
      // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
      queryCache.cancelQueries(KEY)
      // Snapshot the previous value
      const prevData: IPayment[] = queryCache.getQueryData(KEY)
      if (prevData !== undefined) {
        // Optimistically update to the new value
        queryCache.setQueryData(
          KEY,
          prevData.map((x) => (x._id === newData._id ? newData : x))
        )
        // Return a rollback function
        return () => queryCache.setQueryData(KEY, prevData)
      }
    },
    // If the mutation fails, use the rollback function we returned above
    // onError: (err, newData, rollback: () => void) => rollback(),
    // Always refetch after error or success:
    onSettled: () => {
      queryCache.invalidateQueries(KEY)
    },
    throwOnError: true,
  })
}

export function useDeletePayment() {
  return useMutation<IPayment, RestError, string>(api.deletePayment, {
    onMutate: (id) => {
      // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
      queryCache.cancelQueries(KEY)
      // Snapshot the previous value
      const prevData: IPayment[] = queryCache.getQueryData(KEY)
      // Optimistically update to the new value
      queryCache.setQueryData(
        KEY,
        prevData.filter((x) => x._id !== id)
      )
      // Return a rollback function
      return () => queryCache.setQueryData(KEY, prevData)
    },
    // If the mutation fails, use the rollback function we returned above
    onError: (err, newData, rollback: () => void) => rollback(),
    // Always refetch after error or success:
    onSettled: () => {
      queryCache.invalidateQueries(KEY)
    },
    throwOnError: true,
  })
}
