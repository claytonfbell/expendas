import {
  faCreditCard,
  faHome,
  faMoneyBill,
  faMoneyCheckAlt,
  faPiggyBank,
  faUniversity,
} from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { useTheme } from "@material-ui/core"
import React from "react"
import { AccountType } from "../db/Account"

interface Props {
  type: AccountType
}
export function AccountTypeIcon(props: Props) {
  const theme = useTheme()
  return (
    <FontAwesomeIcon
      style={{ opacity: 0.8 }}
      icon={
        props.type === "Checking Account"
          ? faMoneyCheckAlt
          : props.type === "Cash"
          ? faMoneyBill
          : props.type === "Line of Credit" || props.type === "Loan"
          ? faUniversity
          : props.type === "CD" || props.type === "Savings Account"
          ? faPiggyBank
          : props.type === "Home Market Value"
          ? faHome
          : props.type === "Credit Card"
          ? faCreditCard
          : faUniversity
      }
      color={theme.palette.primary.main}
    />
  )
}
