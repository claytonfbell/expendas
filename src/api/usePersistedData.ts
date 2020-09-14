import md5 from "md5"
import React from "react"
import {
  queryCache,
  QueryConfig,
  QueryFunction,
  QueryKey,
  useQuery,
} from "react-query"

export function usePersistedQuery<TResult = unknown, TError = unknown>(
  queryKey: QueryKey,
  queryFn: QueryFunction<TResult>,
  queryConfig?: QueryConfig<TResult, TError>
) {
  const storageKey = `cache-${md5(JSON.stringify(queryKey))}`

  React.useEffect(() => {
    const prevData = queryCache.getQueryData<TResult>(queryKey)
    if (
      (Array.isArray(prevData) && prevData.length === 0) ||
      prevData === undefined
    ) {
      const str = localStorage.getItem(storageKey)
      if (str !== undefined && str !== null) {
        const data = JSON.parse(str)
        queryCache.setQueryData(queryKey, data)
      }
    }
  }, [queryKey, storageKey])

  return useQuery<TResult, TError>(queryKey, queryFn, {
    ...queryConfig,
    onSuccess: (data) => {
      if (queryConfig.onSuccess !== undefined) {
        queryConfig.onSuccess(data)
      }
      localStorage.setItem(storageKey, JSON.stringify(data))
    },
  })
}
