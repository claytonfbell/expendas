import dayjs from "dayjs"
import { useMemo } from "react"

export function useAllRebalanceDates() {
  return useMemo(() => {
    const firstRebalanceDate = dayjs("2026-09-22")
    const rebalanceFrequencyMonths = 3
    const numberOfYears = 30
    const dates = []
    const currentDate = dayjs()
    for (let i = 0; i < (numberOfYears * 12) / rebalanceFrequencyMonths; i++) {
      const newDate = firstRebalanceDate.add(
        i * rebalanceFrequencyMonths,
        "month"
      )
      // exclude past dates
      if (newDate.isAfter(currentDate)) {
        dates.push(newDate)
      }
    }
    return dates
  }, [])
}
