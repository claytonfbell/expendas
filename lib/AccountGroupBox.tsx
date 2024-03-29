import ExpandLessIcon from "@mui/icons-material/ExpandLess"
import ExpandMoreIcon from "@mui/icons-material/ExpandMore"
import {
  Box,
  Collapse,
  Divider,
  Fade,
  List,
  ListItem,
  ListItemIcon,
  ListItemSecondaryAction,
  ListItemText,
  Paper,
  useTheme,
} from "@mui/material"
import { Account, Payment } from "@prisma/client"
import { MD5 } from "crypto-js"
import React from "react"
import { useStorageState } from "react-storage-hooks"
import { AccountBox } from "./AccountBox"
import { AccountGroup } from "./AccountGroup"
import { AccountWithIncludes } from "./AccountWithIncludes"
import { Currency } from "./Currency"
import { ItemWithIncludes } from "./ItemWithIncludes"

type Props = {
  accountGroup: AccountGroup
  accounts: AccountWithIncludes[]
  cycleItems: ItemWithIncludes[]
  isCurrentCycle: boolean
  includeSettled: boolean
  date: string
  onEditAccount: (account: Account) => void
  onEditPayment: (payment: Payment) => void
}

export function AccountGroupBox(props: Props) {
  const theme = useTheme()
  const { accountGroup, isCurrentCycle, date } = props
  const [isExpanded, setIsExpanded] = useStorageState(
    localStorage,
    `AccountGroupBox.isExpanded-${MD5(accountGroup.label)}`,
    true
  )

  // filter-down
  const accounts = (props.accounts || [])
    .filter((x) => accountGroup.types.includes(x.accountType))
    .sort((a, b) => Math.abs(b.balance) - Math.abs(a.balance))

  const cycleItems = (props.cycleItems || []).filter((x) =>
    accounts.map((y) => y.id).includes(x.payment.account.id)
  )

  // find previous carryover
  const carryOver = accounts.reduce((sum, x) => {
    const found = x.carryOver.find((x) => x.date === date)
    return sum + (found !== undefined ? found.amount : x.balance)
  }, 0)
  let startingBalance: number = accounts.reduce(
    (sum, acc) => sum + acc.balance,
    0
  )
  if (!isCurrentCycle) {
    startingBalance = carryOver
  }

  const endingBalance =
    startingBalance +
    cycleItems.filter((x) => !x.isPaid).reduce((x, y) => x + y.amount, 0)

  return (
    <Fade in={accounts.length > 0} unmountOnExit>
      <Paper
        variant="outlined"
        sx={{
          backgroundColor: theme.palette.primary.main,
          color: theme.palette.primary.contrastText,
        }}
      >
        <Box>
          <List>
            <ListItem button onClick={() => setIsExpanded(!isExpanded)}>
              <ListItemIcon>
                {!isExpanded ? (
                  <ExpandMoreIcon style={{ color: "#fff" }} />
                ) : (
                  <ExpandLessIcon style={{ color: "#fff" }} />
                )}
              </ListItemIcon>
              <ListItemText>{accountGroup.label}</ListItemText>
              {!isExpanded ? (
                <ListItemSecondaryAction>
                  <Currency animate value={endingBalance} />
                </ListItemSecondaryAction>
              ) : null}
            </ListItem>
          </List>
          <Collapse in={isExpanded}>
            <Divider />
            <Box
              sx={{
                backgroundColor: theme.palette.background.default,
              }}
            >
              {accounts.map((account) => (
                <AccountBox
                  key={account.id}
                  includeSettled={props.includeSettled}
                  account={account}
                  cycleItems={cycleItems}
                  date={date}
                  isCurrentCycle={isCurrentCycle}
                  onEditAccount={props.onEditAccount}
                  onEditPayment={props.onEditPayment}
                />
              ))}
            </Box>
          </Collapse>
          {isExpanded && accounts.length > 1 ? (
            <List>
              <ListItem button onClick={() => setIsExpanded(!isExpanded)}>
                <ListItemSecondaryAction>
                  <Currency animate value={endingBalance} />
                </ListItemSecondaryAction>
              </ListItem>
            </List>
          ) : null}
        </Box>
      </Paper>
    </Fade>
  )
}
