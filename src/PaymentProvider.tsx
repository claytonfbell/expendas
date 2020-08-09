import React from "react"
import { IPayment } from "./model/Payment"
import { IPaymentMethod } from "./model/PaymentMethod"
import rest from "./rest"

export interface IPaymentPopulated extends IPayment {
  method: IPaymentMethod
}

interface ContextType {
  busy: boolean
  payments: IPaymentPopulated[]
  fetchPayments: () => Promise<void>
}

const Context = React.createContext<ContextType | undefined>(undefined)
export function usePayment() {
  const context = React.useContext(Context)
  if (!context) {
    throw new Error(`usePayment must be used within a PaymentProvider`)
  }
  return context
}

export function PaymentProvider(props: any) {
  const [busy, setBusy] = React.useState(false)
  const [payments, setPayments] = React.useState<IPaymentPopulated[]>([])

  const fetchPayments = React.useCallback(() => {
    setBusy(true)
    return rest
      .get("/payments")
      .then((x) => {
        setPayments(x)
      })
      .finally(() => {
        setBusy(false)
      })
  }, [])

  const value = React.useMemo(
    (): ContextType => ({
      busy,
      payments,
      fetchPayments,
    }),
    [busy, payments, fetchPayments]
  )

  return <Context.Provider value={value} {...props} />
}
