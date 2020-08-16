import React from "react"
import { IAccount } from "./db/Account"
import rest from "./rest"

interface ContextType {
  busy: boolean
  accounts: IAccount[]
  fetchAccounts: () => Promise<void>
  createAccount: (account: IAccount) => Promise<void>
  updateAccount: (account: IAccount) => Promise<void>
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

  const createAccount = React.useCallback((account: IAccount) => {
    setBusy(true)
    return rest.post("/accounts", account).finally(() => {
      setBusy(false)
    })
  }, [])

  const updateAccount = React.useCallback(
    (account: IAccount) => {
      setBusy(true)

      setAccounts((prev) =>
        [...prev.filter((x) => x._id !== account._id), account].sort(
          (a, b) => Math.abs(b.currentBalance) - Math.abs(a.currentBalance)
        )
      )

      return rest
        .put(`/accounts/${account._id}`, account)
        .then(() => {
          fetchAccounts()
        })
        .finally(() => {
          setBusy(false)
        })
    },
    [fetchAccounts]
  )

  const value = React.useMemo(
    (): ContextType => ({
      busy,
      accounts,
      fetchAccounts,
      createAccount,
      updateAccount,
    }),
    [busy, accounts, fetchAccounts, createAccount, updateAccount]
  )

  return <Context.Provider value={value} {...props} />
}
