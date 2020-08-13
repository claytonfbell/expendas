import React from "react"
import { IAccount } from "./db/Account"
import { IPayment } from "./db/Payment"
import PaymentRequest from "./model/PaymentRequest"
import rest from "./rest"

export interface IPaymentPopulated extends IPayment {
  account: IAccount
}

interface ContextType {
  busy: boolean
  payments: IPaymentPopulated[]
  fetchPayments: () => Promise<void>
  createPayment: (params: PaymentRequest) => Promise<void>
  deletePayment: (paymentId: string) => Promise<void>
  updatePayment: (payment: PaymentRequest) => Promise<void>
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
    (params: PaymentRequest) => {
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
    (payment: PaymentRequest) => {
      setBusy(true)
      return rest
        .put(`/payments/${payment.id}`, payment)
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
