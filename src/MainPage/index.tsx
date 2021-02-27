import {
  Box,
  Collapse,
  Divider,
  fade,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  makeStyles,
  Paper,
} from "@material-ui/core"
import ExpandLessIcon from "@material-ui/icons/ExpandLess"
import ExpandMoreIcon from "@material-ui/icons/ExpandMore"
import React from "react"
import { AccountGroup, accountGroups } from "../accountTypes"
import { useFetchAccounts } from "../api/accounts"
import { useFetchCycleDates, useFetchCycleItems } from "../api/cycleItems"
import CycleNavigation from "../CycleNavigation"
import { IAccount } from "../db/Account"
import { ICycleItem } from "../db/CycleItem"

const useAccountGroupBoxStyles = makeStyles((theme) => ({
  root: {
    marginBottom: theme.spacing(4),
  },
}))

export function MainPage() {
  const [date, setDate] = React.useState<string | null>(null)
  const { data: cycleItems } = useFetchCycleItems(date)

  const { data: cycleDates } = useFetchCycleDates()
  React.useEffect(() => {
    if (cycleDates.length > 0 && date === null) {
      setDate(cycleDates[0])
    }
  }, [cycleDates, date])

  return date === null ? null : (
    <>
      <CycleNavigation date={date} onChange={(x) => setDate(x)} />

      {accountGroups.map((accountGroup) => (
        <AccountGroupBox
          key={accountGroup.label}
          accountGroup={accountGroup}
          cycleItems={cycleItems}
        />
      ))}
    </>
  )
}

type AccountGroupProps = {
  accountGroup: AccountGroup
  cycleItems: ICycleItem[]
}

function AccountGroupBox(props: AccountGroupProps) {
  const classes = useAccountGroupBoxStyles()
  const { accountGroup, cycleItems } = props
  const [isExpanded, setIsExpanded] = React.useState(false)
  const { data: unfilteredAccounts } = useFetchAccounts()

  const accounts = unfilteredAccounts.filter((x) =>
    accountGroup.types.includes(x.type)
  )

  return accounts.length === 0 ? null : (
    <Paper elevation={4} className={classes.root}>
      <Box>
        <List>
          <ListItem button onClick={() => setIsExpanded(!isExpanded)}>
            <ListItemIcon>
              {!isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            </ListItemIcon>
            <ListItemText>{accountGroup.label}</ListItemText>
          </ListItem>
        </List>
        <Collapse in={isExpanded}>
          <Divider />
          {accounts.map((account) => (
            <AccountBox
              key={account._id}
              account={account}
              cycleItems={cycleItems}
            />
          ))}
        </Collapse>
      </Box>
    </Paper>
  )
}

const useAccountBoxStyles = makeStyles((theme) => ({
  title: {
    backgroundColor: fade(theme.palette.primary.main, 0.3),
    paddingLeft: theme.spacing(3),
    paddingTop: theme.spacing(1),
    paddingBottom: theme.spacing(1),
    fontWeight: "bold",
  },
  item: {
    paddingLeft: theme.spacing(6),
    paddingRight: theme.spacing(3),
    paddingTop: theme.spacing(1),
    paddingBottom: theme.spacing(1),
    "&:nth-of-type(odd)": {
      backgroundColor: fade(theme.palette.primary.main, 0.1),
    },
  },
}))

type AccountBoxProps = {
  account: IAccount
  cycleItems: ICycleItem[]
}

function AccountBox(props: AccountBoxProps) {
  const classes = useAccountBoxStyles()
  const { account } = props

  const cycleItems = (props.cycleItems || []).filter(
    (x) => x.payment.account._id === account._id
  )

  return (
    <>
      <Box className={classes.title}>{account.name}</Box>
      {cycleItems.map((item) => (
        <Box key={item._id} className={classes.item}>
          {item.payment.paidTo}
        </Box>
      ))}
    </>
  )
}
