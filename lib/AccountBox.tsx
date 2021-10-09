import AddIcon from "@mui/icons-material/Add"
import {
  alpha,
  Box,
  Fade,
  Grid,
  IconButton,
  lighten,
  Link,
  Theme,
  Tooltip,
  useTheme,
} from "@mui/material"
import { SxProps } from "@mui/system"
import { Account, Payment } from "@prisma/client"
import clsx from "clsx"
import React, { useState } from "react"
import { useDebounce } from "react-use"
import { displayAccountType } from "./accountTypes"
import { AccountWithIncludes } from "./AccountWithIncludes"
import { AmountInputTool } from "./AmountInputTool"
import { useUpdateAccount } from "./api/api"
import { Currency } from "./Currency"
import { CycleItemRow } from "./CycleItemRow"
import { ItemWithIncludes } from "./ItemWithIncludes"
import { PayCardNow } from "./PayCardNow"

export const accountBoxStylesItem = (theme: Theme): SxProps<Theme> => ({
  color: theme.palette.text.primary,
  "&:nth-of-type(odd)": {
    backgroundColor: alpha(theme.palette.primary.main, 0.12),
  },
  "&.paid": {
    textDecoration: "line-through",
    color: lighten(theme.palette.text.primary, 0.7),
  },
})

export const accountBoxStylesRight = (theme: Theme): SxProps<Theme> => ({
  paddingTop: theme.spacing(1),
  paddingBottom: theme.spacing(1),
  paddingRight: theme.spacing(2),
  textAlign: "right",
  "&.total": {
    borderTop: `2px solid ${lighten(theme.palette.primary.main, 0.5)}`,
  },
})

type AccountBoxProps = {
  account: AccountWithIncludes
  cycleItems: ItemWithIncludes[]
  date: string
  isCurrentCycle: boolean
  includeSettled: boolean
  onEditAccount: (account: Account) => void
  onEditPayment: (payment: Payment) => void
}

export function AccountBox(props: AccountBoxProps) {
  const theme = useTheme()
  const { account, date, isCurrentCycle } = props

  const cycleItems = (props.cycleItems || []).filter(
    (x) => x.payment.account.id === account.id
  )

  // find previous carryover
  const carryOver = React.useMemo(() => {
    const found = account.carryOver.find((x) => x.date === date)
    return found !== undefined ? found.amount : account.balance
  }, [account.carryOver, account.balance, date])
  let startingBalance = account.balance
  if (!isCurrentCycle) {
    startingBalance = carryOver
  }

  const endingBalance =
    startingBalance +
    cycleItems.filter((x) => !x.isPaid).reduce((x, y) => x + y.amount, 0)

  const { mutateAsync: updateAccount } = useUpdateAccount()

  const handleAddItem = () =>
    props.onEditPayment({
      id: 0,
      isPaycheck: false,
      description: "",
      amount: 0,
      repeatsOnDates: [],
      repeatsOnDaysOfMonth: [],
      repeatsOnMonthsOfYear: [],
      repeatsUntilDate: null,
      repeatsWeekly: null,
      accountId: account.id,
      date,
    })

  const [isHoverDebounce, setIsHoverDebounce] = useState(false)
  const [isHover, setIsHover] = useState(false)
  useDebounce(
    () => {
      setIsHover(isHoverDebounce)
    },
    50,
    [isHoverDebounce]
  )

  return (
    <>
      <Box
        sx={{
          borderTop: `1px solid ${theme.palette.primary.main}`,
          color: theme.palette.text.primary,
          backgroundColor: alpha(theme.palette.primary.main, 0.2),
          paddingLeft: theme.spacing(2),
          paddingRight: theme.spacing(2),
          paddingTop: theme.spacing(1),
          paddingBottom: theme.spacing(1),
          textTransform: "uppercase",
          "&:nth-of-type(odd)": {
            backgroundColor: alpha(theme.palette.primary.main, 0.3),
          },
        }}
        onMouseOver={() => setIsHoverDebounce(true)}
        onMouseOut={() => setIsHoverDebounce(false)}
      >
        <Grid container justifyContent="space-between">
          <Grid item xs={8}>
            <Link
              sx={{ cursor: "pointer" }}
              onClick={() => props.onEditAccount(account)}
            >
              {account.name} {displayAccountType(account.accountType)}
            </Link>

            <Fade in={isHover}>
              <Tooltip title="Add New Item">
                <IconButton
                  size="small"
                  sx={{
                    color: theme.palette.primary.main,
                    marginLeft: theme.spacing(1),
                    fontSize: 18,
                    position: "absolute",
                    marginTop: -2,
                  }}
                  onClick={handleAddItem}
                >
                  <AddIcon fontSize="inherit" />
                </IconButton>
              </Tooltip>
            </Fade>
          </Grid>
          <Grid
            item
            xs={4}
            sx={{
              textAlign: "right",
            }}
          >
            <AmountInputTool
              enabled={isCurrentCycle}
              value={startingBalance}
              onChange={(x) => updateAccount({ ...account, balance: x })}
            />
          </Grid>
        </Grid>
      </Box>
      {cycleItems.map((item) => (
        <CycleItemRow
          key={item.id}
          item={item}
          onEditPayment={props.onEditPayment}
        />
      ))}
      {cycleItems.length === 0 && !props.includeSettled ? null : (
        <Box sx={accountBoxStylesItem(theme)}>
          <Grid container>
            {endingBalance !== startingBalance ? (
              <>
                <Grid
                  item
                  xs={8}
                  sx={{
                    paddingTop: theme.spacing(1),
                    paddingBottom: theme.spacing(1),
                    paddingLeft: theme.spacing(2),
                  }}
                >
                  <Link sx={{ cursor: "pointer" }} onClick={handleAddItem}>
                    + Add New Item
                  </Link>
                </Grid>
                <Grid
                  item
                  xs={4}
                  sx={accountBoxStylesRight(theme)}
                  className={clsx("total")}
                >
                  <Currency red animate value={endingBalance} />
                </Grid>
              </>
            ) : null}
            {isCurrentCycle && account.accountType === "Checking_Account" ? (
              <Grid item xs={12}>
                <Box padding={2}>
                  <PayCardNow
                    account={account}
                    endingBalance={endingBalance}
                    onClick={(p) => props.onEditPayment(p)}
                    date={date}
                  />
                </Box>
              </Grid>
            ) : null}
          </Grid>
        </Box>
      )}
    </>
  )
}
