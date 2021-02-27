import {
  faApple,
  faCcAmex,
  faCcDiscover,
  faCcMastercard,
  faCcVisa,
} from "@fortawesome/free-brands-svg-icons"
import {
  faHome,
  faMoneyBill,
  faMoneyCheckAlt,
  faPiggyBank,
  faUniversity,
} from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { useTheme } from "@material-ui/core"
import React from "react"
import { IAccount } from "../db/Account"

interface Props {
  account: IAccount
}
export function AccountIcon(props: Props) {
  const theme = useTheme()
  return (
    <FontAwesomeIcon
      style={{ opacity: 0.8 }}
      icon={
        props.account.type === "Checking Account"
          ? faMoneyCheckAlt
          : props.account.type === "Cash"
          ? faMoneyBill
          : props.account.type === "Line of Credit" ||
            props.account.type === "Loan"
          ? faUniversity
          : props.account.type === "CD" ||
            props.account.type === "Savings Account"
          ? faPiggyBank
          : props.account.type === "Home Market Value"
          ? faHome
          : props.account.creditCardType === "Visa"
          ? faCcVisa
          : props.account.creditCardType === "Apple Card"
          ? faApple
          : props.account.creditCardType === "American Express"
          ? faCcAmex
          : props.account.creditCardType === "Discover"
          ? faCcDiscover
          : faCcMastercard
      }
      color={theme.palette.primary.main}
    />
  )
}
