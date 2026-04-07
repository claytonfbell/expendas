import ExpandLessIcon from "@mui/icons-material/ExpandLess"
import ExpandMoreIcon from "@mui/icons-material/ExpandMore"
import {
  Collapse,
  Grid2,
  IconButton,
  Stack,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material"
import { AccountBucket, RetirementPlan } from "@prisma/client"
import { CurrencyFieldBase } from "material-ui-pack"
import { useEffect, useMemo, useState } from "react"
import { displayAccountBucket } from "./accountBuckets"
import { AccountWithIncludes } from "./AccountWithIncludes"
import {
  useFetchAccounts,
  useFetchRetirementPlanContributions,
  useUpdateRetirementPlanContributions,
} from "./api/api"
import DisplayError from "./DisplayError"
import { formatMoney } from "./formatMoney"

type StateItem = {
  accountId: number
  amount: number
}

interface Props {
  retirementPlan: RetirementPlan
}

export function RetirementPlanContributions({ retirementPlan }: Props) {
  const { data: contributions } = useFetchRetirementPlanContributions(
    retirementPlan.id
  )
  const { data: accounts } = useFetchAccounts()
  const retirementAccounts = useMemo(
    () =>
      accounts
        ?.filter((x) => x.accountType === "Investment")
        .sort((a, b) =>
          a.accountBucket && b.accountBucket
            ? a.accountBucket.localeCompare(b.accountBucket)
            : 0
        ) ?? [],
    [accounts]
  )

  const [state, setState] = useState<StateItem[]>([])

  useEffect(() => {
    if (contributions !== undefined) {
      const newState: StateItem[] = []
      retirementAccounts.forEach((account) => {
        const contribution = contributions.find(
          (c) => c.accountId === account.id
        )
        newState.push({
          accountId: account.id,
          amount: contribution?.amount ?? 0,
        })
      })
      setState(newState)
    }
  }, [contributions, retirementAccounts])

  const {
    mutateAsync: updateRetirementContributions,
    status,
    error,
  } = useUpdateRetirementPlanContributions()

  useEffect(() => {
    const timeout = setTimeout(() => {
      updateRetirementContributions({
        retirementPlanId: retirementPlan.id,
        contributions: state.map((item) => ({
          accountId: item.accountId,
          amount: item.amount,
        })),
      })
    }, 1000)

    return () => clearTimeout(timeout)
  }, [state, retirementPlan.id])

  const totalSavedPerMonth =
    state.length > 0 ? state.reduce((a, b) => a + b.amount, 0) : 0
  const totalSavedPerYear = totalSavedPerMonth * 12

  const savedSoFar = useMemo(() => {
    return retirementAccounts.reduce((sum, account) => {
      return sum + account.balance
    }, 0)
  }, [retirementAccounts])

  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"))
  const [collapsed, setCollapsed] = useState(!isMobile)

  const accountsGroupedByBucket = useMemo(() => {
    const groups: {
      [bucket: string]: AccountWithIncludes[]
    } = {}
    state.forEach((item) => {
      const account = accounts?.find((a) => a.id === item.accountId)
      if (account) {
        const bucket = account.accountBucket ?? "Other"
        if (!groups[bucket]) {
          groups[bucket] = []
        }
        groups[bucket].push(account)
      }
    })
    return groups
  }, [state, accounts])

  return (
    <Stack spacing={3} paddingLeft={2} alignItems={{ xs: "stretch" }}>
      <Stack
        direction={{ xs: "column", sm: "row" }}
        alignItems={"baseline"}
        spacing={2}
      >
        <Typography variant="h4">Savings</Typography>
        <Stack>
          {formatMoney(totalSavedPerMonth, true)} mo /{" "}
          {formatMoney(totalSavedPerYear, true)} yr
        </Stack>
        <Stack>{formatMoney(savedSoFar, true)} current</Stack>
        <IconButton
          sx={{
            display: { xs: "none", sm: "block" },
          }}
          onClick={() => setCollapsed(!collapsed)}
        >
          {collapsed ? <ExpandMoreIcon /> : <ExpandLessIcon />}
        </IconButton>
      </Stack>

      <DisplayError error={error} />
      <Collapse in={!collapsed} unmountOnExit>
        <Stack spacing={2}>
          {Object.entries(accountsGroupedByBucket).map(([bucket, accounts]) => {
            return (
              <Grid2
                key={bucket}
                container
                spacing={2}
                width={"100%"}
                columns={16}
                alignItems={{ sm: "start", md: "center" }}
              >
                <Grid2 size={{ xs: 4, sm: 3, md: 2 }} key={bucket}>
                  {displayAccountBucket(bucket as AccountBucket)}
                </Grid2>
                <Grid2 size={12}>
                  <Grid2 container spacing={2} columns={12}>
                    {accounts.map((account) => {
                      return (
                        <Grid2
                          key={account.id}
                          size={{ xs: 6, sm: 4, md: 3, lg: 2 }}
                        >
                          <CurrencyFieldBase
                            fullWidth
                            currency="USD"
                            allowCents={false}
                            label={account.name}
                            value={
                              (state.find(
                                (item) => item.accountId === account.id
                              )?.amount ?? 0) / 100
                            }
                            onChange={(x) => {
                              setState((prev) => {
                                const newState = [...prev]
                                const index = newState.findIndex(
                                  (item) => item.accountId === account.id
                                )
                                if (index !== -1) {
                                  newState[index] = {
                                    accountId: account.id,
                                    amount: Math.round(x * 100),
                                  }
                                } else {
                                  newState.push({
                                    accountId: account.id,
                                    amount: Math.round(x * 100),
                                  })
                                }
                                return newState
                              })
                            }}
                          />
                        </Grid2>
                      )
                    })}
                  </Grid2>
                </Grid2>
              </Grid2>
            )
          })}
        </Stack>
      </Collapse>
    </Stack>
  )
}
