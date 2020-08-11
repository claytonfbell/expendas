import React from "react"
import { IAccount } from "./model/Account"
import rest from "./rest"

interface ContextType {
  busy: boolean
  accounts: IAccount[]
  fetchAccounts: () => Promise<void>
}

const Context = React.createContext<ContextType | undefined>(undefined)
export function useAccount() {
  const context = React.useContext(Context)
  if (!context) {
    throw new Error(`useAccount must be used within a AccountProvider`)
  }
  return context
}

export function AccountProvider(props: any) {
  const [busy, setBusy] = React.useState(false)
  const [accounts, setAccounts] = React.useState<IAccount[]>([])

  const fetchAccounts = React.useCallback(() => {
    setBusy(true)
    return rest
      .get("/accounts")
      .then((x) => {
        setAccounts(x)
      })
      .finally(() => {
        setBusy(false)
      })
  }, [])

  const value = React.useMemo(
    (): ContextType => ({
      busy,
      accounts,
      fetchAccounts,
    }),
    [busy, accounts, fetchAccounts]
  )

  return <Context.Provider value={value} {...props} />
}
