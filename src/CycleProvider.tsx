import React from "react"
import { IPayment } from "./model/Payment"
import rest from "./rest"

interface ContextType {
  busy: boolean
  cycleDates: string[]
  cycle: IPayment[] | null
  fetchCycleDates: () => Promise<void>
  fetchCycle: (date: string) => Promise<void>
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
  const [cycle, setCycle] = React.useState<IPayment[] | null>(null)

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

  const value = React.useMemo(
    (): ContextType => ({
      busy,
      cycleDates,
      cycle,
      fetchCycleDates,
      fetchCycle,
    }),
    [busy, cycleDates, cycle, fetchCycleDates, fetchCycle]
  )

  return <Context.Provider value={value} {...props} />
}
