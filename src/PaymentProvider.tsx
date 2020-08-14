import React from "react"
import { IPayment, IPaymentPopulated } from "./db/Payment"
import rest from "./rest"

interface ContextType {
  busy: boolean
  payments: IPaymentPopulated[]
  fetchPayments: () => Promise<void>
  createPayment: (params: IPayment) => Promise<void>
  deletePayment: (paymentId: string) => Promise<void>
  updatePayment: (payment: IPayment) => Promise<void>
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

  const createPayment = React.useCallback(
    (params: IPayment) => {
      setBusy(true)
      return rest
        .post("/payments", params)
        .then(() => {
          fetchPayments()
        })
        .finally(() => {
          setBusy(false)
        })
    },
    [fetchPayments]
  )

  const deletePayment = React.useCallback(
    (paymentId: string) => {
      setBusy(true)
      return rest
        .delete(`/payments/${paymentId}`)
        .then(() => {
          fetchPayments()
        })
        .finally(() => {
          setBusy(false)
        })
    },
    [fetchPayments]
  )

  const updatePayment = React.useCallback(
    (payment: IPayment) => {
      setBusy(true)
      return rest
        .put(`/payments/${payment._id}`, payment)
        .then(() => {
          fetchPayments()
        })
        .finally(() => {
          setBusy(false)
        })
    },
    [fetchPayments]
  )

  const value = React.useMemo(
    (): ContextType => ({
      busy,
      payments,
      fetchPayments,
      createPayment,
      deletePayment,
      updatePayment,
    }),
    [busy, payments, fetchPayments, createPayment, deletePayment, updatePayment]
  )

  return <Context.Provider value={value} {...props} />
}
