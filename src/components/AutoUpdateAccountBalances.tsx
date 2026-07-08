import { useAutoUpdateBalances } from "./api/hooks/useAutoUpdateBalances"

export function AutoUpdateAccountBalances() {
  useAutoUpdateBalances()
  return null
}