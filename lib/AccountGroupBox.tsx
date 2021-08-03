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
  makeStyles,
  Paper,
} from "@material-ui/core"
import ExpandLessIcon from "@material-ui/icons/ExpandLess"
import ExpandMoreIcon from "@material-ui/icons/ExpandMore"
import { Account, Payment } from "@prisma/client"
import React from "react"
import { AccountBox } from "./AccountBox"
import { AccountGroup } from "./AccountGroup"
import { AccountWithIncludes } from "./AccountWithIncludes"
import { Currency } from "./Currency"
import { ItemWithIncludes } from "./ItemWithIncludes"

const useStyles = makeStyles((theme) => ({
  root: {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.primary.contrastText,
    [theme.breakpoints.up("lg")]: {
      minWidth: 400,
    },
  },
}))

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
  const classes = useStyles()
  const { accountGroup, isCurrentCycle, date } = props
  const [isExpanded, setIsExpanded] = React.useState(false)

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
      <Paper elevation={6} className={classes.root}>
        <Box>
          <List>
            <ListItem button onClick={() => setIsExpanded(!isExpanded)}>
              <ListItemIcon>
                {!isExpanded ? (
                  <ExpandLessIcon style={{ color: "#fff" }} />
                ) : (
                  <ExpandMoreIcon style={{ color: "#fff" }} />
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
