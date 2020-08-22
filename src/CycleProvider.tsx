import React from "react"
import { ICycleItem, ICycleItemPopulated } from "./db/CycleItem"
import rest from "./rest"

interface ContextType {
  busy: boolean
  cycleDates: string[]
  cycle: ICycleItemPopulated[]
  fetchCycleDates: () => Promise<void>
  fetchCycle: (date: string) => Promise<void>
  refreshCycle: () => Promise<void>
  updateCycleItem: (cycleItem: ICycleItem) => Promise<void>
  reset: () => void
}

const Context = React.createContext<ContextType | undefined>(undefined)
export function useCycle() {
  const context = React.useContext(Context)
  if (!context) {
    throw new Error(`useCycle must be used within a CycleProvider`)
  }
  return context
}

export function CycleProvider(props: any) {
  const [busy, setBusy] = React.useState(false)
  const [cycleDates, setCycleDates] = React.useState<string[]>([])
  const [cycle, setCycle] = React.useState<ICycleItemPopulated[]>([])
  const [lastCycleDate, setLastCycleDate] = React.useState<string>()

  const fetchCycleDates = React.useCallback(() => {
    setBusy(true)
    return rest
      .get("/cycles")
      .then((x) => {
        setCycleDates(x)
      })
      .finally(() => {
        setBusy(false)
      })
  }, [])

  const fetchCycle = React.useCallback((date: string) => {
    setLastCycleDate(date)
    setBusy(true)
    setCycle([])
    return rest
      .get(`/cycles/${date}`)
      .then((x) => {
        setCycle(x)
      })
      .finally(() => {
        setBusy(false)
      })
  }, [])

  const refreshCycle = React.useCallback(() => {
    if (lastCycleDate !== undefined) {
      return fetchCycle(lastCycleDate)
    }
  }, [fetchCycle, lastCycleDate])

  const reset = React.useCallback(() => {
    setCycle([])
  }, [])

  const updateCycleItem = React.useCallback(
    (cycleItem: ICycleItemPopulated) => {
      setBusy(true)
      setCycle((prev) =>
        [...prev.filter((x) => x._id !== cycleItem._id), cycleItem].sort(
          (a, b) => Math.abs(b.amount) - Math.abs(a.amount)
        )
      )
      return rest.put(`/cycleItems/${cycleItem._id}`, cycleItem).finally(() => {
        setBusy(false)
      })
    },
    []
  )

  const value = React.useMemo(
    (): ContextType => ({
      busy,
      cycleDates,
      cycle,
      fetchCycleDates,
      fetchCycle,
      updateCycleItem,
      refreshCycle,
      reset,
    }),
    [
      busy,
      cycleDates,
      cycle,
      fetchCycleDates,
      fetchCycle,
      updateCycleItem,
      refreshCycle,
      reset,
    ]
  )

  return <Context.Provider value={value} {...props} />
}
