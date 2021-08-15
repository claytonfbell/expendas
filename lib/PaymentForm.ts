import { Payment } from "@prisma/client"

export type PaymentForm = Payment & {
  accountId2?: number
  isTransfer?: boolean
}
