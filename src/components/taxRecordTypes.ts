import { TaxRecordType } from "@prisma/client"

export const taxRecordTypes: TaxRecordType[] = [
  "Federal",
  "Federal_State",
  "State",
  "Local",
  "Property",
  "Estimated",
  "Other",
]

export function displayTaxRecordType(taxRecordType: TaxRecordType) {
  switch (taxRecordType) {
    case "Federal":
      return "Federal"
    case "Federal_State":
      return "Federal & State"
    case "State":
      return "State"
    case "Local":
      return "Local"
    case "Property":
      return "Property"
    case "Estimated":
      return "Estimated"
    case "Other":
      return "Other"
    default:
      return taxRecordType
  }
}
