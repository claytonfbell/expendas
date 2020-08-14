import React from "react"
import { ICycleItem, ICycleItemPopulated } from "./db/CycleItem"
import rest from "./rest"

interface ContextType {
  busy: boolean
  cycleDates: string[]
  cycle: ICycleItemPopulated[] | null
  fetchCycleDates: () => Promise<void>
  fetchCycle: (date: string) => Promise<void>
  updateCycleItem: (cycleItem: ICycleItem) => Promise<void>
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
  const [cycle, setCycle] = React.useState<ICycleItemPopulated[] | null>(null)

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
    setBusy(true)
    return rest
      .get(`/cycles/${date}`)
      .then((x) => {
        setCycle(x)
      })
      .finally(() => {
        setBusy(false)
      })
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
    }),
    [busy, cycleDates, cycle, fetchCycleDates, fetchCycle, updateCycleItem]
  )

  return <Context.Provider value={value} {...props} />
}
