import { queryCache, useMutation } from "react-query"
import { ICycleItemPopulated } from "../db/CycleItem"
import rest, { RestError } from "../rest"
import { usePersistedQuery } from "./usePersistedData"

const KEY = "cycleItems"

const api = {
  fetchCycleDates: (): Promise<string[]> => rest.get("/cycles"),
  fetchCycleItems: (
    key: string,
    date: string
  ): Promise<ICycleItemPopulated[]> => rest.get(`/cycles/${date}`),
  updateCycleItem: (cycleItem: ICycleItemPopulated) =>
    rest.put(`/cycleItems/${cycleItem._id}`, cycleItem),
}

export function useFetchCycleDates() {
  return usePersistedQuery<string[], RestError>(
    "cycleDates",
    api.fetchCycleDates,
    {
      initialData: [],
      initialStale: true,
    }
  )
}

export function useFetchCycleItems(date: string) {
  return usePersistedQuery<ICycleItemPopulated[], RestError>(
    [KEY, date],
    api.fetchCycleItems,
    {
      initialData: [],
      initialStale: true,
    }
  )
}

export function refreshCycleItems() {
  queryCache.invalidateQueries(KEY)
}

export function useUpdateCycleItem() {
  return useMutation<ICycleItemPopulated, RestError, ICycleItemPopulated>(
    api.updateCycleItem,
    {
      onMutate: (newData) => {
        // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
        queryCache.cancelQueries([KEY, newData.date])
        // Snapshot the previous value
        const prevData: ICycleItemPopulated[] = queryCache.getQueryData([
          KEY,
          newData.date,
        ])
        // Optimistically update to the new value
        queryCache.setQueryData(
          [KEY, newData.date],
          prevData.map((x) => (x._id === newData._id ? newData : x))
        )
        // Return a rollback function
        return () => queryCache.setQueryData([KEY, newData.date], prevData)
      },
      // If the mutation fails, use the rollback function we returned above
      //   onError: (err, newData, rollback: () => void) => rollback(),
      // Always refetch after error or success:
      onSettled: () => {
        queryCache.invalidateQueries(KEY)
      },
    }
  )
}
