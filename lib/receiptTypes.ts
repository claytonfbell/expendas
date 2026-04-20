import { ReceiptType } from "@prisma/client"

export const receiptTypes: ReceiptType[] = ["Charity", "HSA_Eligible", "Other"]

export function getReceiptTypeLabel(receiptType: ReceiptType) {
  switch (receiptType) {
    case "Charity":
      return "Charity"
    case "HSA_Eligible":
      return "HSA Eligible"
    case "Other":
      return "Other"
    default:
      return receiptType
  }
}
